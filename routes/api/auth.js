const express = require('express')
const validateBody = require('../../validate/users.js')
const User = require('../../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const authMiddleware = require('../../middlewares/auth.js')
const uploadAva = require('../../middlewares/avatar.js')
const gravatar = require('gravatar');
const Jimp = require('jimp');
const fs = require('fs/promises')
const path = require('path')
require('dotenv').config()
const { JWT_SECRET } = process.env
const router = express.Router()

router.post('/users/register', async (req, res, next) => {
    const { password } = req.body
    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(password, salt)

    try {
        const { error } = validateBody.userRegistSchema.validate(req.body, { abortEarly: false })
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join('; ')
            throw new Error(errorMessage)
        }
        const avatar = gravatar.url(req.body.email, {
            s: '250',
            r: 'pg',
            d: 'retro'

        }, true);
        const result = await User.create({
            email: req.body.email,
            password: hashedPassword,
            avatarUrl: avatar
        })
        res.status(201).json({ user: { email: result.email, subscription: result.subscription, avatarUrl: result.avatarUrl } })
    } catch (error) {
        if (error.message.includes('E11000 duplicate key error')) {
            res.status(409).json({ message: 'Email in use' })
        }
        return error
    }
})

router.post('/users/login', async (req, res, next) => {

    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        const isValidPassword = await bcrypt.compare(password, user.password)

        if (!user || !isValidPassword) {
            res.status(401).json({ message: "Email or password is wrong" })
        }
        const token = jwt.sign({ id: user._id }, JWT_SECRET)
        res.status(200).json({ token: token, user: { email: user.email, subscription: user.subscription } })

    } catch (error) {
        return error
    }
})

router.post('/users/logout', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        user.token = ''
        return res.status(204).send();
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/users/current', authMiddleware, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-_id email subscription avatarUrl');
        if (!user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

router.patch('/user', authMiddleware, async (req, res, next) => {
    const { subscription } = req.body;
    try {
        const { error } = validateBody.subscriptionSchema.validate(subscription);
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updatedUser = await User.findOneAndUpdate({ _id: user }, req.body, { new: true })
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

router.patch('/users/avatars', authMiddleware, uploadAva.single('avatarUrl'), async (req, res, next) => {
    try {
        const { filename } = req.file
        if (!filename) {
            return res.status(400).json({ message: 'File is not find.' });
        }

        const tmpPath = path.resolve(__dirname, '../../tmp', filename)
        const publicPath = path.resolve(__dirname, '../../public/avatars', filename)

        try {
            await fs.rename(tmpPath, publicPath)
        } catch (error) {
            await fs.unlink(tmpPath)
            throw error
        }
        const image = await Jimp.read(publicPath);

        image.resize(250, 250);

        await image.writeAsync(publicPath);
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { avatarUrl: `public/avatars/${filename}` },
            { new: true }
        )
        if (!user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        res.json({ avatarUrl: user.avatarUrl })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

module.exports = router