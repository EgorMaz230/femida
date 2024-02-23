const Level = require("../models/Level");

module.exports = async function (user, userId) {
  if (user.xp >= 150) {
    const updateLevel = user.level + 1;
    const addXp = user.xp - 150;
    await Level.findOneAndUpdate(
      { userId: userId },
      { level: updateLevel, xp: addXp }
    );
  }
};
