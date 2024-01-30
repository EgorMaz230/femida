const Level = require("../models/Level");

module.exports = async (usersIds, client) => {
    let guildId = await Level.find({});
    guildId = guildId[0].guildId;
    const guild = client.guilds.cache.get(guildId);

    try {
        const usersArr = [];
        await Promise.all(
            usersIds.map(async (userId) => {
                try {
                    const member = await guild.members.fetch(userId);
                    usersArr.push(member.user);
                } catch (error) {
                    console.error(
                        `Error fetching user with ID ${userId}:`,
                        error.message
                    );
                }
            })
        );

        return usersArr;
    } catch (error) {
        console.error("Error fetching users:", error.message);
        throw error;
    }
}