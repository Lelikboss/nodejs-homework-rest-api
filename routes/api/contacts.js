const express = require('express')
const { isValidObjectId } = require('mongoose')
const router = express.Router()
const validateBody = require('../../validate/contacts.js')
const Contact = require('../../models/contact.js')

router.get('/', async (req, res, next) => {
  try {
    const result = await Contact.find()
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/:contactId', async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const result = await Contact.findById(contactId);
    res.json(result);
  } catch (error) {
    if (!isValidObjectId(contactId)) {
      res.status(404).json({ message: 'Not Found' })
    } else {
      const { status = 500, message = 'Server Error' } = error
      res.status(status).json({ message })
    }

  }
})

router.post('/', async (req, res, next) => {
  try {
    const { error } = validateBody.createContactShema.validate(req.body, { abortEarly: false })
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join('; ')
      throw new Error(errorMessage)
    }
    const newContact = await Contact.create(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    next(error)
  }
})

router.delete('/:contactId', async (req, res, next) => {
  const { contactId } = req.params;
  try {
    await Contact.findByIdAndRemove(contactId);

    res.json({ message: 'Contact deleted' });
  } catch (error) {
    if (!isValidObjectId(contactId)) {
      res.status(404).json({ message: 'Not Found' })
    }
    res.status(500).json({ message: error.message })
  }
})

router.put('/:contactId', async (req, res, next) => {
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

router.patch('/:contactId/favorite', async (req, res, next) => {
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
