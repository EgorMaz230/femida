const Level = require("../models/Level");
const updateLevel = require("../utils/updateLevel");

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

        if (
          newState.member.roles.cache.has("953717386224226385") ||
          newState.member.roles.cache.has("953795856308510760")
        ) {
          const userIds = members.map((member) => member.user.id);
          userIds.forEach(async (user) => {
            const people = await Level.findOne({ userId: user });
            if (people.currentXp !== 150) {
            let updateXp = people.currentXp + 30;
            if(updateXp > 150) {
              updateXp = 150
            }
            await Level.findOneAndUpdate(
              { userId: user },
              { currentXp: updateXp }
            );
            await updateLevel(people, user);
            }
          });
        } else {
          const userIds = members.map((member) => member.user.id);
          userIds.forEach(async (user) => {
            if (
              voiceChannel.guild.members.cache
                .get(user)
                .roles.cache.has("953717386224226385") ||
              voiceChannel.guild.members.cache
                .get(user)
                .roles.cache.has("953795856308510760")
            ) {
              const people = await Level.findOne({ userId: newState.id });
              if (people.currentXp !== 150) {
              let updateXp = people.currentXp + 30;
              if(updateXp > 150) {
                updateXp = 150
              }
              await Level.findOneAndUpdate(
                { userId: newState.id },
                { currentXp: updateXp }
              );
              await updateLevel(people, user);
            }}
          });
        }
      }
      fetchMembers();
    }
  }
};
