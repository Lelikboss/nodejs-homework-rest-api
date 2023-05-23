const { Schema, model } = require("mongoose");
const schema = new Schema({
    password: {
        type: String,
        required: [true, 'Set password for user'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
    },
    subscription: {
        type: String,
        enum: ["starter", "pro", "business"],
        default: "starter"
    },
    avatarUrl: {
        type: String,
        default: '',
    },
    token: {
        type: String,
        default: null,
    }
})

const User = model('user', schema)
module.exports = User