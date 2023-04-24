const fs = require('fs/promises');
const path = require('path');
const { v1: uuidv1 } = require('uuid')

const contactsPath = path.join(__dirname, 'contacts.json');
const contactsListNormalization = async (contacts) => await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2), 'utf-8');


const listContacts = async () => {
  const data = await fs.readFile(contactsPath, 'utf-8')
  return JSON.parse(data)
}

const getContactById = async (contactId) => {
  const contacts = await listContacts();
  const result = contacts.find((item) => item.id === contactId);
  return result || null;
};

const removeContact = async (contactId) => {
  const contacts = await listContacts();
  const index = contacts.findIndex((item) => item.id === contactId);
  if (index === -1) return null
  const [result] = contacts.splice(index, 1)
  contactsListNormalization(contacts)
  return result
}

const addContact = async (body) => {
  const contacts = await listContacts();
  const newContact = { id: uuidv1(), ...body };
  contacts.push(newContact);
  contactsListNormalization(contacts)
  return newContact;
}

const updateContact = async (contactId, body) => {
  const contacts = await listContacts()
  const index = contacts.findIndex((item) => item.id === contactId)
  if (index === -1) return null
  contacts[index] = { id: contactId, ...body }
  contactsListNormalization(contacts)
  return contacts[index]
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
