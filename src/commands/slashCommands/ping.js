const { SlashCommandBuilder } = require("discord.js");

module.exports ={
  data: new SlashCommandBuilder()
  .setName("ping")
    .setDescription("ping pong"),
  async execute(interaction) {
  await interaction.reply('Pong')
}}


  
// export const commands = [pingCommand.toJSON()];
