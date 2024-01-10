const { Schema, Model, model } = require("mongoose");

const autoRoleSchema = new Schema({
    guildId: {
        type: String,
        required: true,
    },
    roleId : {
        type: String,
        required: true
    }
});

module.exports = model('AutoRole', autoRoleSchema)