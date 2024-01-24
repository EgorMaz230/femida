const Level = require("../models/Level");
const db = require("mongoose");

module.exports = async function accrualPoints(message) {
  if (message.content.length > 3 && !message.author.bot) {
    const people = await Level.findOne({ userId: message.author.id });
    const updateXp = people.xp + 0.5;
    await Level.findOneAndUpdate(
      { userId: message.author.id },
      { xp: updateXp }
    );
    console.log("message:", people);
  }
};
