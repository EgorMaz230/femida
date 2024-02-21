const Level = require("../models/Level");

module.exports = async (message) => {
    const user = message.author.id;
    await Level.findOneAndUpdate({ userId: user }, { currentXp: 99 });
    const check =  await Level.findOne({ userId: user });
    console.log(check)
}