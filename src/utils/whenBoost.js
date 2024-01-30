const Level = require("../models/Level");
const { EmbedBuilder } = require("discord.js");

module.exports = async (oldMember, newMember, client) => {
    if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
        if (!oldMember.roles.cache.has("1192072016866574386") &&
            newMember.roles.cache.has("1192072016866574386")
        ) {
            const userId = newMember.user.id;

            //? Adding XP for boost

            const userData = await Level.findOne({ userId: userId });
            console.log(userData);

            const updatedXp = userData.xp + 50;

            await Level.findOneAndUpdate({ userId: userId }, { xp: updatedXp });

            //? Sending a message of boost into the system channel

            const titleChoose = [
                "Unexpected boost!",
                "Pleasant boost!",
                "Surprising boost!",
            ][Math.floor(Math.random() * 3)];

            const userIcon = `https://cdn.discordapp.com/avatars/${userId}/${newMember.user.avatar}.png?size=256`;
            const boostEmbed = new EmbedBuilder()
                .setColor("#f47fff")
                .setTitle(titleChoose)
                .setDescription(
                    `<@${userId.toString()}> has just boosted this server!\n+50 XP`
                )
                .setAuthor({
                    name: newMember.user.username,
                    iconURL: userIcon,
                })
                .setTimestamp();

            client.guilds.cache.first().systemChannel.send({
                embeds: [boostEmbed],
            });
        }
    }
}