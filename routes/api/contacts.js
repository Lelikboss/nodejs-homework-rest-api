const express = require('express')
const { isValidObjectId } = require('mongoose')
const router = express.Router()
const validateBody = require('../../validate/contacts.js')
const Contact = require('../../models/contact.js')

const authMiddleware = require('../../middlewares/auth.js')
const ownerMiddleware = require('../../middlewares/owner.js')

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

router.get('/:contactId', authMiddleware, ownerMiddleware, async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const result = await Contact.findById(contactId);
    if (!result) {
      return res.status(404).json({ message: 'Not Found' });
    }
    res.json(result);
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
    let newContact = await Contact.create({ ...req.body, owner });
    const hiddenFields = { owner: 0 };
    newContact = await Contact.findById(newContact._id).select(hiddenFields);
    res.status(201).json(newContact);
  } catch (error) {
    next(error)
  }
})
router.delete('/:contactId', authMiddleware, ownerMiddleware, async (req, res, next) => {
  const { contactId } = req.params;
  try {
    await Contact.findByIdAndRemove(contactId);

    res.json({ message: 'Contact deleted' });
  } catch (error) {
    if (!isValidObjectId(contactId)) {
      return res.status(404).json({ message: 'Not Found' })
    }
    return res.status(500).json({ message: error.message })
  }
})
router.put('/:contactId', authMiddleware, ownerMiddleware, async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ message: 'Not Found' });
    }
    const { error } = validateBody.updateContactSchema.validate(req.body, { abortEarly: false })
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join('; ')
      throw new Error(errorMessage)
    }
    const updatedContact = await Contact.findOneAndUpdate({ _id: contactId }, req.body, { new: true })
    res.status(200).json(updatedContact);
  } catch (error) {
    if (!isValidObjectId(contactId)) {
      return res.status(404).json({ message: 'Not Found' });
    }
    return res.status(500).json({ message: error.message });
  }
})
router.patch('/:contactId/favorite', authMiddleware, ownerMiddleware, async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ message: 'Not Found' });
    }
    const { error } = validateBody.updateContactFavoriteSchema.validate(req.body, { abortEarly: false })
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join('; ')
      throw new Error(errorMessage)
    }
    const updatedContact = await Contact.findOneAndUpdate({ _id: contactId }, req.body, { new: true })
    res.status(200).json(updatedContact);
  } catch (error) {
    if (!isValidObjectId(contactId)) {
      return res.status(404).json({ message: 'Not Found' });
    }
    return res.status(500).json({ message: error.message });
  }
})
module.exports = router
