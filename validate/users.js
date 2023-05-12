const Joi = require("joi")

const userRegistSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    password: Joi.string().min(8).required()
})
const subscriptionSchema = Joi.string().valid('starter', 'pro', 'business');


module.exports = { userRegistSchema, subscriptionSchema }