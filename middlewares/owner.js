const Contact = require('../models/contact')
const { isValidObjectId } = require('mongoose')

const checkContactOwner = async (req, res, next) => {
    const { contactId } = req.params;
    try {
        const contact = await Contact.findOne({ _id: contactId, owner: req.user._id });
        if (!contact) {
            return res.status(404).json({ message: 'Not Found' });
        }
        next()
    } catch (error) {
        if (!isValidObjectId(contactId)) {
            return res.status(404).json({ message: 'Not Found' });
        }
        return res.status(500).json({ message: error.message });
    }
};

module.exports = checkContactOwner
