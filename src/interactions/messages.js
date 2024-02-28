const Level = require("../models/Level");
const db = require("mongoose");
const sameLetters = require("../utils/sameLetters")
const updateLevel = require('../utils/updateLevel');


module.exports = async function accrualPoints(message) {
  if (
    message.content.length > 3 &&
    !message.author.bot &&
    sameLetters(message.content)
  ) {
    const userId = message.author.id;
    const people = await Level.findOne({ userId: userId });
    const updateXp = people.currentXp + 0.5;
    await Level.findOneAndUpdate({ userId: userId }, { currentXp: updateXp });
    await updateLevel(people, userId);
  }
};
