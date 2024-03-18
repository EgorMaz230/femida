const { ReactionUserManager } = require("discord.js");
const Level = require("../models/Level");


module.exports = async (interaction, message, newState) => {
  let currentUsers = null;
  console.log(message);
  if (interaction) {

    currentUsers = await Level.find({ userId: interaction.user.id });
    if (currentUsers.length === 0) {
      const newUser = new Level({
        userId: interaction.user.id,
        guildId: interaction.guild.id,
        xp: 0,
        currentXp: 0,
        level: 1,
      });

      await newUser.save();
    }
  } else if (message) {
    if(message.author.bot) return
    currentUsers = await Level.find({ userId: message.author.id });
        if (currentUsers.length === 0) {
            const newUser = new Level({
                userId: message.author.id,
                guildId: message.guildId,
                xp: 0,
                currentXp: 0,
                level: 1,
            });

            await newUser.save();
        }
    } else if (newState) {
        currentUsers = await Level.find({ userId: newState.id });
        if (currentUsers.length === 0) {
            const newUser = new Level({
                userId: newState.id,
                guildId: newState.guild.id,
                xp: 0,
                currentXp: 0,
                level: 1,
            });

            await newUser.save();
        }
    } else {
        return;
    }
    // if (currentUsers.length === 0) {
    //   const newUser = new Level({
    //     userId: interaction.user.id ? interaction.user.id : message.author.id,
    //     guildId: interaction.guild.id ? interaction.guild.id : message.guildId,
    //     xp: 0,
    //     currentXp: 0,
    //     level: 1,
    //   });

    //   await newUser.save();
    // }
};