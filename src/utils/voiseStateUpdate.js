const Level = require("../models/Level");

module.exports = async (client, newState) => {
     const voiceChannels = client.channels.cache.filter((elem) => elem.type === 2);
    const arrObj = [];
    // console.log("newstateid", newState.channelId);

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

        userIds.forEach(async(user) => {
            const people = await Level.findOne({ userId: user });
            const updateXp = people.xp + 0.5;
            await Level.findOneAndUpdate({ userId: user }, { xp: updateXp });
            if (people.xp >= 100) {
                const updtaeLevel = people.level + 1;
                const addXp = 100 - people.xp;
                await Level.findOneAndUpdate({ userId: user }, { level: updtaeLevel, xp: addXp });
            }
            console.log("people", people);
        });
    }

    if (arrObj.length >= 4) {
        fetchMembers();
    }
}