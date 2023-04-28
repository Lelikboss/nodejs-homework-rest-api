const express = require('express')
const contacts = require('../../models/contacts.js')
const router = express.Router()

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
