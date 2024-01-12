import {
  Client,
  GatewayIntentBits,
  Guild,
  Routes,
  Events,
  Collection,
} from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { config } from "dotenv";
import { REST } from "@discordjs/rest";
import { commands } from "./commands/ping.js";
// import { commands } from "./getAllFiles";

// const fs = require("node:fs");
// const path = require("node:path");

//? import fs from "node:fs";
//? import path from "node:path";
//? import { fileURLToPath } from "url";

config();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const rest = new REST({ version: "10" }).setToken(TOKEN);

//? lala

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// client.commands = new Collection();

// console.log(__dirname);
// console.log(__filename);

// const foldersPath = path.join("../", "commands");
// const commandFolders = fs.readdirSync(foldersPath);

// for (const folder of commandFolders) {
//   const commandsPath = path.join(foldersPath, folder);
//   const commandFiles = fs
//     .readdirSync(commandsPath)
//     .filter((file) => file.endsWith(".js"));
//   for (const file of commandFiles) {
//     const filePath = path.join(commandsPath, file);
//     const command = require(filePath);
//     // Set a new item in the Collection with the key as the command name and the value as the exported module
//     if ("data" in command && "execute" in command) {
//       client.commands.set(command.data.name, command);
//     } else {
//       console.log(
//         `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
//       );
//     }
//   }
// }

//? al;a

client.on("ready", () => console.log("I am ready to use"));

client.on(Events.InteractionCreate, (interaction) => {
  console.log(interaction);
  if (interaction.isChatInputCommand()) {
    switch (interaction.commandName) {
      case "ping":
        interaction.reply({
          content: "pong",
        });

        return;

      default:
        break;
    }
  }
  // interaction.reply({
  //     content:
  // })
});

client.on(Events.MessageCreate, (msg) => {
  console.log(msg);
  try {
    if (!msg.author.bot) {
      msg.channel.send(msg.content);
    }
  } catch (e) {
    console.log(e);
  }
});

async function main() {
  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });
    client.login(TOKEN);
  } catch (error) {
    console.log(error);
  }
}
main();
