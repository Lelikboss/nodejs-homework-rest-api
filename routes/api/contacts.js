const express = require('express')
const contacts = require('../../models/contacts.js')
const router = express.Router()
const Joi = require('joi')

const createContactShema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string()
    .email({ minDomainSegments: 2 }).required(),
  phone: Joi.string().regex(/^[0-9]{10}$/).messages({ 'string.pattern.base': `Phone number must have 10 digits.` }).required()
})

router.get('/', async (req, res, next) => {
  try {
    const result = await contacts.listContacts()
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await contacts.getContactById(contactId);
    if (result) {
      res.json(result);
    } else {
      const error = new Error('Not Found')
      error.status = 404
      throw error
    }
  } catch (error) {
    const { status = 500, message = 'Server Error' } = error
    res.status(status).json({ message })
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { error } = createContactShema.validate(req.body)
    if (error) {
      const errorNew = new Error(error)
      error.status = 404
      throw errorNew
    }
    const newContact = await contacts.addContact(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
})

router.delete('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params;
    await contacts.removeContact(contactId);
    res.json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.put('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await contacts.getContactById(contactId);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    const updatedContact = await contacts.updateContact(contactId, req.body);
    res.status(201).json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
