const { ReactionUserManager } = require("discord.js");
const Level = require("../models/Level");

module.exports = async (interaction, message, newState) => {
  let currentUsers = null;
  if (interaction){
  currentUsers = await Level.find({ userId: interaction.user.id });
} else if (message){
  currentUsers = await Level.find({ userId: message.author.id });
} else if (newState){
 currentUsers = await Level.find({ userId:  newState.id });
} else {
  return;
}

  if (currentUsers.length === 0) {
    const newUser = new Level({
      userId: interaction.user.id,
      guildId: interaction.guild.id,
      xp: 0,
      level: 1,
    });

    await newUser.save();
  }
};
