const Level = require("../models/Level");
const updateLevel = require("../utils/updateLevel");

module.exports = async(oldState, newState, client) => {
    const studentRoleId = "1260674858602467428"; // Роль 'student'

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
                userIds.forEach(async(user) => {
                    const member = members.get(user);
                    const people = await Level.findOne({ userId: user });
                    let xpToAdd = 20;

                    if (member.roles.cache.has(studentRoleId)) {
                        xpToAdd *= 2; // Нараховуємо подвійну кількість XP для студентів
                    }

                    if (people.currentXp !== 150) {
                        let updateXp = people.currentXp + xpToAdd;
                        if (updateXp > 150) {
                            updateXp = 150;
                        }
                        await Level.findOneAndUpdate({ userId: user }, { currentXp: updateXp });
                        await updateLevel(people, user);
                    }
                });
            }

            if (chanelMembers.length === 4) {
                await fetchMembers();
            }

            if (arrObj.length > 4) {
                const member = arrObj.get(newState.id);
                const people = await Level.findOne({ userId: newState.id });
                let xpToAdd = 20;

                if (member.roles.cache.has(studentRoleId)) {
                    xpToAdd *= 2; // Нараховуємо подвійну кількість XP для студентів
                }

                const updateXp = people.currentXp + xpToAdd;
                await Level.findOneAndUpdate({ userId: newState.id }, { currentXp: updateXp });
                await updateLevel(people, newState.id);
            }
        }
    }
};