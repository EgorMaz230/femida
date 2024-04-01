const Level = require("../models/Level");
const updateLevel = require("../utils/updateLevel");

module.exports = async (oldState, newState, client) => {
  if (newState.channelId) {
    if (!oldState.channelId && newState.channelId) {
      const voiceChannels = client.channels.cache.filter(
        (elem) => elem.type === 2 || elem.type === 13
      );
      let stvoiceChannel = {};
      await client.channels
        .fetch(newState.channelId)
        .then((channel) => (stvoiceChannel = channel))
        .catch((err) => console.log(err));

      const arrObj = stvoiceChannel.members;
      const chanelMembers = arrObj.map((member) => member.user.id);

      async function fetchMembers() {
        let voiceChannel = {};
        await client.channels
          .fetch(newState.channelId)
          .then((channel) => (voiceChannel = channel))
          .catch((err) => console.log(err));

        const members = voiceChannel.members;

        const userIds = members.map((member) => member.user.id);
        userIds.forEach(async (user) => {
          const people = await Level.findOne({ userId: user });
          if (people.currentXp !== 150) {
            let updateXp = people.currentXp + 20;
            if (updateXp > 150) {
              updateXp = 150;
            }
            await Level.findOneAndUpdate(
              { userId: user },
              { currentXp: updateXp }
            );
            await updateLevel(people, user);
            // console.log("people", people);
          }
        });
      }

      if (chanelMembers.length === 4) {
        await fetchMembers();
      }

      if (arrObj.length > 4) {
        const people = await Level.findOne({ userId: newState.id });
        const updateXp = people.xp + 20;
        await Level.findOneAndUpdate(
          { userId: newState.id },
          { currentXp: updateXp }
        );
        await updateLevel(people, newState.id);
      }
    }
  }
};
