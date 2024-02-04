const Level = require("../models/Level");

module.exports = async (oldState, newState, client) => {
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
        // console.log('members', members);

        const userIds = members.map((member) => member.user.id);
        userIds.forEach(async (user) => {
          const people = await Level.findOne({ userId: user });
          const updateXp = people.xp + 20;
          await Level.findOneAndUpdate({ userId: user }, { xp: updateXp });
          if (people.xp >= 150) {
            const updtaeLevel = people.level + 1;
            const addXp = people.xp - 150;
            await Level.findOneAndUpdate(
              { userId: user },
              { level: updtaeLevel, xp: addXp }
            );
          }
          console.log("people", people);
        });
      }

      if (arrObj.length >= 1) {
        fetchMembers();
        console.log("hello");
      }
    }
  }
};
