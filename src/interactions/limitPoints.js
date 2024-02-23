const Level = require("../models/Level");
const cron = require("cron");

module.exports = async () => {
  const currentUsers = await Level.find();

  function users() {
    currentUsers.map((currentUser) => {
      const userXp = currentUser.currentXp;
      const xp = currentUser.xp;
      const updateXp = userXp + xp;

      update(currentUser, updateXp);
    });
  }

  const hours = new cron.CronJob("00 00 00 * * *", users);
  hours.start();

  async function update(currentUser, updateXp) {
    await Level.findOneAndUpdate(
      { userId: currentUser.userId },
      { xp: updateXp, currentXp: 0 }
    );
  }
};
