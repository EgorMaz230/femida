const addPoints = require("../utils/addPoints");

module.exports = async function updateInvites(person, client) {
  client.guilds.cache.each((guild) => {
    guild.invites.fetch().then((guildInvites) => {
      guildInvites.each((guildInvite) => {
        if (String(guildInvite.inviterId) in mainObj) {
          const newValue =
            global.tempObj[String(guildInvite.inviterId)] + guildInvite.uses;
          global.tempObj[String(guildInvite.inviterId)] = newValue;
        }
      });
    });
  });

  let res = await person.guild.members.fetch();
  function up() {
    res.forEach((member) => {
      if (!member.user.bot) {
        if (
          global.tempObj[String(member.user.id)] !==
          global.mainObj[String(member.user.id)]
        ) {
          global.mainObj[String(member.user.id)] =
            global.tempObj[String(member.user.id)];
          addPoints(member.user.id, 100);
        }
      }
    });
  }
  setTimeout(up, 500);
};
