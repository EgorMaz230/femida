const Level = require("../models/Level");
const updateLevel = require("../utils/updateLevel");
const cron = require("cron");

module.exports = async () => {
  async function update(currentUser, updateXp) {
    await Level.findOneAndUpdate(
      { userId: currentUser.userId },
      { xp: updateXp, currentXp: 0 }
    );
  }

  async function users() {
    const currentUsers = await Level.find({});
    currentUsers.map(async (currentUser) => {
      const userXp = currentUser.currentXp;
      const xp = currentUser.xp;
      const updateXp = userXp + xp;

      await update(currentUser, updateXp);
      await updateLevel(currentUser, currentUser.userId);
    });
  }

  const hours = new cron.CronJob("00 00 00 * * *", users);
  hours.start();
};
