const Joi = require("joi")

const createContactShema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string()
        .email({ minDomainSegments: 2 }).required(),
    phone: Joi.string().regex(/^[0-9]{10}$/).messages({ 'string.pattern.base': `Phone number must have 10 digits.` }),
    favorite: Joi.boolean().default(false)
})
const updateContactSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string().email({ minDomainSegments: 2 }).allow('', null),
    phone: Joi.string().allow('', null).regex(/^[0-9]{10}$/).messages({ 'string.pattern.base': `Phone number must have 10 digits.` }),
    favorite: Joi.boolean()
})
const updateContactFavoriteSchema = Joi.object({
    favorite: Joi.boolean()
})
module.exports = { createContactShema, updateContactSchema, updateContactFavoriteSchema }