const Level = require("../models/Level");
const updateLevel = require("../utils/updateLevel");

module.exports = async (oldState, newState, client) => {
  if (newState.channelId) {
    if (!oldState.channelId && newState.channelId) {
      const voiceChannels = client.channels.cache.filter(
        (elem) => elem.type === 2 || elem.type === 13
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

        const userIds = members.map((member) => member.user.id);
        userIds.forEach(async (user) => {
          const people = await Level.findOne({ userId: user });
          if (people.currentXp !== 150) {
          let updateXp = people.currentXp + 20;
          if(updateXp > 150) {
            updateXp = 150
          }
          await Level.findOneAndUpdate({ userId: user }, { currentXp: updateXp });
          await updateLevel(people, user);
          // console.log("people", people);
          }
        });
      }

      if (arrObj.length === 4) {
        fetchMembers();
      }

      if (arrObj.length > 4) {
        const people = await Level.findOne({ userId: newState.id });
        const updateXp = people.xp + 20;
        await Level.findOneAndUpdate({ userId: newState.id }, { currentXp: updateXp });
        if (people.xp >= 150) {
          const updtaeLevel = people.level + 1;
          const addXp = people.xp - 150;
          await Level.findOneAndUpdate(
            { userId: newState.id },
            { level: updtaeLevel, xp: addXp }
          );
        }
      }
    }
  }
};
