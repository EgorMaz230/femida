const cron = require("cron");

module.exports = async function fetchInvites(op, client) {
  global.mainObj = {};
  global.tempObj = {};
  global.userList = [];
  const guild = op.guilds.cache.get("953708116611051600");
  let res = await guild.members.fetch();
  res.forEach((member) => {
    if (!member.user.bot) {
      global.mainObj[String(member.user.id)] = 0;
      global.tempObj[String(member.user.id)] = 0;
      global.userList[String(member.user.id)] = 1;
    }
  });
  
  function updateLimit() {
    res.forEach((member) => {
      if (!member.user.bot) {
        global.userList[String(member.user.id)] = 1;
      }
    });
  }
  const timer = new cron.CronJob("00 00 00 * * *", updateLimit);
  timer.start();

  client.guilds.cache.each((guild) => {
    guild.invites.fetch().then((guildInvites) => {
      guildInvites.each((guildInvite) => {
        if (String(guildInvite.inviterId) in global.mainObj) {
          const newValue =
            global.mainObj[String(guildInvite.inviterId)] + guildInvite.uses;
          global.mainObj[String(guildInvite.inviterId)] = newValue;
        }
      });
    });
  });
};
