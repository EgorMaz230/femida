const Level = require("../models/Level");
const db = require("mongoose");
const sameLetters = require("../utils/sameLetters");
const updateLevel = require("../utils/updateLevel");

module.exports = async function accrualPoints(message) {
  console.log("limit")
  const userId = message.author.id;
    const people = await Level.findOne({ userId: userId });
    if(people.currentXp !== 150){
  if (
    message.content.length > 3 &&
    !message.author.bot &&
    sameLetters(message.content)
  ) {
    const userId = message.author.id;
    const people = await Level.findOne({ userId: userId });
    let updateXp = people.currentXp + 2;
    console.log("first", updateXp)
    if (updateXp > 150){
      updateXp = 150
      console.log("second",updateXp)
    }
    await Level.findOneAndUpdate({ userId: userId }, { currentXp: updateXp });
    await updateLevel(people, userId);
  }
}

};
