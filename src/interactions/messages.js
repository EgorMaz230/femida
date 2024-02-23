const Level = require("../models/Level");
const db = require("mongoose");
<<<<<<< HEAD:src/interactions/messages.js
const sameLetters = require("../utils/sameLetters")

=======
const updateLevel = require("./updateLevel");

function sameLetters(content) {
  for (let i = 1; i < content.length; i++) {
    if (content[i] !== content[i - 1]) {
      return true;
    }
  }
  return false;
}
>>>>>>> 6931b958790e74cfe3b5def5e30ba4432976c92c:src/utils/messages.js

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
    updateLevel(people, userId);
    // console.log("message:", people);
  }
};
