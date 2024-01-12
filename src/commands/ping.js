import { SlashCommandBuilder } from "discord.js";

const pingCommand = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("ping pong");


  
export const commands = [pingCommand.toJSON()];
