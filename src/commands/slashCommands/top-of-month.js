const { SlashCommandBuilder } = require("discord.js");
const Level = require("../../models/Level");
const db = require("mongoose");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("top")
    .setDescription("Shows top of the mounth"),
  async execute(interaction) {
    if (!interaction.inGuild()) {
      interaction.reply("You can't run this command inside a server");
      return;
    }
    const users = await Level.find();
    console.log(users);
  },
};
