const express = require('express')
const { isValidObjectId } = require('mongoose')
const router = express.Router()
const validateBody = require('../../validate/contacts.js')
const Contact = require('../../models/contact.js')

const authMiddleware = require('../../middlewares/auth.js')

router.get('/', authMiddleware, async (req, res, next) => {

  try {
    const { _id: owner } = req.user;
    const { error } = validateBody.filterAndLimitSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    const { page = 1, limit = 20, favorite } = req.query;
    const filter = favorite ? { favorite, owner } : { owner };
    const hiddenFields = { owner: 0, __v: 0 }
    const result = await Contact.find(filter).limit(limit * 1)
      .skip((page - 1) * limit).select(hiddenFields)
      .exec();
    const count = await Contact.countDocuments(filter);
    res.json({
      result,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/:contactId', authMiddleware, async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contact = await Contact.findOne({ _id: contactId, owner: req.user._id }).select({ owner: 0, __v: 0 });
    if (!contact) {
      return res.status(404).json({ message: 'Not Found' });
    }
    res.json(contact);
  } catch (error) {
    if (!isValidObjectId(contactId)) {
      return res.status(404).json({ message: 'Not Found' })
    } else {
      const { status = 500, message = 'Server Error' } = error
      res.status(status).json({ message })
    }

  }
})
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { _id: owner } = req.user;

    const { error } = validateBody.createContactShema.validate(req.body, { abortEarly: false })
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join('; ')
      throw new Error(errorMessage)
    }
    const newContact = await Contact.create({ ...req.body, owner });
    res.status(201).json(newContact);
  } catch (error) {
    next(error)
  }
})
router.delete('/:contactId', authMiddleware, async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contact = await Contact.findOneAndRemove({ _id: contactId, owner: req.user._id });
    if (!contact) {
      return res.status(404).json({ message: 'Not Found' });
    }
    res.json({ message: 'Contact deleted' });
  } catch (error) {
    if (!isValidObjectId(contactId)) {
      return res.status(404).json({ message: 'Not Found' })
    }
    return res.status(500).json({ message: error.message })
  }
})
router.put('/:contactId', authMiddleware, async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const { error } = validateBody.updateContactSchema.validate(req.body, { abortEarly: false })
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join('; ')
      throw new Error(errorMessage)
    }
    const updatedContact = await Contact.findOneAndUpdate({ _id: contactId, owner: req.user._id }, req.body, { new: true }).select({ owner: 0, __v: 0 })
    if (!updatedContact) {
      return res.status(404).json({ message: 'Not Found' });
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    if (!isValidObjectId(contactId)) {
      return res.status(404).json({ message: 'Not Found' });
    }
    return res.status(500).json({ message: error.message });
  }
})
router.patch('/:contactId/favorite', authMiddleware, async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const { error } = validateBody.updateContactFavoriteSchema.validate(req.body, { abortEarly: false })
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join('; ')
      throw new Error(errorMessage)
    }
    const updatedContact = await Contact.findOneAndUpdate({ _id: contactId, owner: req.user._id }, req.body, { new: true })
    if (!updatedContact) {
      return res.status(404).json({ message: 'Not Found' });
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    if (!isValidObjectId(contactId)) {
      return res.status(404).json({ message: 'Not Found' });
    }
    return res.status(500).json({ message: error.message });
  }
})
module.exports = router
