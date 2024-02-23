module.exports = async function fetchInvites(op, client) {
  global.mainObj = {};
  global.tempObj = {};
  const guild = op.guilds.cache.get("1192065857363394621");
  let res = await guild.members.fetch();
  res.forEach((member) => {
    if (!member.user.bot) {
      global.mainObj[String(member.user.id)] = 0;
      global.tempObj[String(member.user.id)] = 0;
    }
  });

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
