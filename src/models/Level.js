const { Schema, model } = require("mongoose");

const levelSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  xp: {
    type: Number,
    default: 0,
    min: 0,
  },
  level: {
    type: Number,
    default: 0,
  },
  currentXp: {
    type: Number,
    max: 150,
    default: 0,
  },
});

module.exports = model("Level", levelSchema);
