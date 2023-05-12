const jwt = require('jsonwebtoken')
require('dotenv').config()
const { JWT_SECRET } = process.env
const User = require('../models/user')

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization || ''
    const [type, token] = authHeader.split(' ')
    if (!token) { return res.status(401).json({ message: 'No token provided' }) }

    if (type !== 'Bearer') {
        return res.status(401).json({ message: 'Token type is not valid!' })
    }

    try {
        const { id } = jwt.verify(token, JWT_SECRET)
        const user = await User.findById(id)
        req.user = user
    } catch (error) {
        console.log(req.url);
        if (
            error.name === 'TokenExpiredError' ||
            error.name === 'JsonWebTokenError'
        ) {
            if (req.url === `/users/current`) {
                return res.status(401).json({ message: 'Not authorized' })
            }
            return res.status(401).json({ message: 'JWT token is not valid' })
        }
        return error
    }

    next()
}

module.exports = authMiddleware