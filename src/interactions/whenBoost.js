const Level = require("../models/Level");
const updateLevel = require("../utils/updateLevel");
const { EmbedBuilder } = require("discord.js");

module.exports = async (oldMember, newMember, client) => {
  if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
    if (
      !oldMember.roles.cache.has("1192072016866574386") &&
      newMember.roles.cache.has("1192072016866574386")
    ) {
      const userId = newMember.user.id;

      //? Adding XP for boost

      let userData = await Level.findOne({ userId: userId });
      console.log(userData);

      if (userData === null) {
        userData = new Level({
          userId: userId,
          guildId: newMember.guild.id,
          xp: 0,
          level: 1,
          currentXp: 0,
        });

        await userData.save();
      }

      const updatedXp = userData.xp + 50;

      await Level.findOneAndUpdate({ userId: userId }, { xp: updatedXp });
      await updateLevel(userData, userId);
      //? Sending a message of boost into the system channel

      const titleChoose = [
        "Неочікуваний буст!",
        "Приємний буст!",
        "Несподіваний буст!",
      ][Math.floor(Math.random() * 3)];

      const userIcon = `https://cdn.discordapp.com/avatars/${userId}/${newMember.user.avatar}.png?size=256`;
      const boostEmbed = new EmbedBuilder()
        .setColor("#f47fff")
        .setTitle(titleChoose)
        .setDescription(
          `<@${userId.toString()}> тільки що забустив цей сервер!\n+50 XP`
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
};
