const Level = require("../models/Level");

module.exports = async function checkRoleInVc(oldState, newState, client) {
  if (newState.channelId) {
    if (!oldState.channelId && newState.channelId) {
      const voiceChannels = client.channels.cache.filter(
        (elem) => elem.type === 2
      );
      const arrObj = [];
      voiceChannels.forEach((voiceChannel) => {
        arrObj.push(voiceChannel.members);
      });

      async function fetchMembers() {
        let voiceChannel = {};
        await client.channels
          .fetch(newState.channelId)
          .then((channel) => (voiceChannel = channel))
          .catch((err) => console.log(err));

        const members = voiceChannel.members;

        if (newState.member.roles.cache.has("1192066790717661245")) {
          const userIds = members.map((member) => member.user.id);
          userIds.forEach(async (user) => {
            const people = await Level.findOne({ userId: user });
            const updateXp = people.xp + 30;
            await Level.findOneAndUpdate({ userId: user }, { xp: updateXp });
            if (people.xp >= 150) {
              const updtaeLevel = people.level + 1;
              const addXp = people.xp - 150;
              await Level.findOneAndUpdate(
                { userId: user },
                { level: updtaeLevel, xp: addXp }
              );
            }
          });
        } else {
          const userIds = members.map((member) => member.user.id);
          userIds.forEach(async (user) => {
            if (
              voiceChannel.guild.members.cache
                .get(user)
                .roles.cache.has("1192066790717661245")
            ) {
              const people = await Level.findOne({ userId: newState.id });
              const updateXp = people.xp + 30;
              await Level.findOneAndUpdate(
                { userId: newState.id },
                { xp: updateXp }
              );
              if (people.xp >= 150) {
                const updtaeLevel = people.level + 1;
                const addXp = people.xp - 150;
                await Level.findOneAndUpdate(
                  { userId: newState.id },
                  { level: updtaeLevel, xp: addXp }
                );
              }
            }
          });
        }
      }
      fetchMembers();
    }
  }
};
