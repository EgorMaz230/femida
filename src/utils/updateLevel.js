const Level = require("../models/Level");

module.exports = async function updateLevel({ level, xp }, userId) {
  let xpForCurrentLvl = 0;
  for (let i = 0; i < level; i++) {
    xpForCurrentLvl += 5 * Math.pow(i, 2) + 50 * i + 100;
  }
  let newLevel = 0;
  function calculateXPForLevel(lvl) {
    let xpForLevel = 0;
    for (let i = 0; i < lvl; i++) {
      xpForLevel += 5 * Math.pow(i, 2) + 50 * i + 100;
    }
    return xpForLevel;
  }
  while (xp >= calculateXPForLevel(newLevel + 1)) {
    newLevel++;
  }
  await Level.findOneAndUpdate({ userId: userId }, { level: newLevel });
};
