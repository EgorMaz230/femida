const { config } = require("dotenv");
const Level = require("../models/Level");
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
    try {
      await fetch(
        `https://discord.com/api/channels/1050608203945234442/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            content: `<@${userId}> досяг ${newLevel} рівня. Вітаємо тебе!`,
          }),
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "Authorization": `Bot ${process.env.TOKEN}`,
          },
        }
      );
    } catch (err) {
      console.log("Discord API error" + " " + err);
    }
  }
  await Level.findOneAndUpdate({ userId }, { level: newLevel });
  return newLevel;
};
