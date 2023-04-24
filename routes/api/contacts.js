const express = require('express')
const contacts = require('../../models/contacts.js')
const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const result = await contacts.listContacts()
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.get('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await contacts.getContactById(contactId);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    next(error);
  }
})

router.post('/', async (req, res, next) => {
  try {
    const newContact = await contacts.addContact(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
})

router.delete('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params;
    await contacts.removeContact(contactId);
    res.json({ message: 'Contact deleted' });
  } catch (error) {
    next(error);
  }
})

router.put('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const updatedContact = await contacts.updateContact(contactId, req.body);
    res.status(201).json(updatedContact);
  } catch (error) {
    next(error);
  }
})

module.exports = router
