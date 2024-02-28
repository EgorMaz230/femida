const Level = require("../models/Level");
const updateLevel = require("../utils/updateLevel");
const { EmbedBuilder } = require("discord.js");

module.exports = async (oldMember, newMember, client) => {
  console.log("old mem", oldMember.premiumSinceTimestamp);
  console.log("newfag", newMember.premiumSinceTimestamp);

  if (oldMember.premiumSinceTimestamp || newMember.premiumSinceTimestamp) {
    if (
      (!oldMember.premiumSinceTimestamp && newMember.premiumSinceTimestamp) ||
      oldMember.premiumSinceTimestamp !== newMember.premiumSinceTimestamp
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

        await userData.save(); //? adding new user to DB if he's not there
      }

      const updatedXp = userData.xp + 50;

      await Level.findOneAndUpdate({ userId: userId }, { xp: updatedXp });
      updateLevel(userData, userId);
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
          `<@${userId.toString()}> тільки що забустив/ла цей сервер!\nВам нараховано 50 XP. Дякуємо за підтримку💜`
        )
        .setAuthor({
          name: newMember.user.username,
          iconURL: userIcon,
        })
        .setThumbnail(userIcon)
        .setTimestamp();

      client.guilds.cache.first().systemChannel.send({
        embeds: [boostEmbed],
      });
    }
  }
};
