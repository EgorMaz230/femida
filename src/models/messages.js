const { Schema, model } = require("mongoose");

const messageSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    }
})
module.exports = model('messages', messageSchema)