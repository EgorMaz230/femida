const { config } = require("dotenv");
const Level = require("../models/Level");
const sendLevelNotification = require("./sendLevelNotification");
const sendDmMsg = require("./sendDmMsg");
config();

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
  if (newLevel > level) {
    const params = { id: userId, level: newLevel };
    await sendLevelNotification(params);
    if (newLevel % 5 === 0) await sendDmMsg(params);
  }
  await Level.findOneAndUpdate({ userId }, { level: newLevel });
  return newLevel;
};
