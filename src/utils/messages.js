const Level = require("../models/Level");
const db = require("mongoose");

function sameLetters(content) {
  for (let i = 1; i < content.length;i++) {
    if (content[i] !== content[i-1]) {
      return true;
    }
  }
  return false;
}

module.exports = async function accrualPoints(message) {
  if (message.content.length > 3 && !message.author.bot && sameLetters(message.content)) {
    const people = await Level.findOne({ userId: message.author.id });
    const updateXp = people.xp + 0.5;
    await Level.findOneAndUpdate(
      { userId: message.author.id },
      { xp: updateXp }
    );
    console.log("message:", people);
  }
};
