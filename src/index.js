const {
  Client,
  GatewayIntentBits,
  Guild,
  Routes,
  Events,
  Collection} = require("discord.js");
const { config } = require("dotenv");
const accrualPoints = require("./utils/messages.js");
const getMembersInVoiceChanel = require("./utils/voicechanel.js");
const { default: mongoose } = require('mongoose');
const Level = require("./models/Level");

// const { REST } = require( "@discordjs/rest");
const fs = require("node:fs");
const path = require("node:path");

config();

const TOKEN = process.env.TOKEN;
// const CLIENT_ID = process.env.CLIENT_ID;
// const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// const rest = new REST({ version: "10" }).setToken(TOKEN);

client.commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

client.on("ready", async () => {
  console.log(`${client.user.tag} is online`);
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to DB');
  } catch (error) {
    console.log(`There was an error whil connecting to database ${error}`);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const currentUsers = await Level.find({ userId: interaction.user.id });
  // console.log(currentUsers)
  
  if (currentUsers.length === 0) {
        const newUser = new Level (
           {
             userId: interaction.user.id,
             guildId: interaction.guild.id,
             xp: 0,
             level: 1
           }
    )
    console.log('some')
    // console.log(await newUser.save())
    await newUser.save()
       }

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found`);
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

//todo: Обробник подій який додає бали за повідомлення довші за 3 літери
client.on("messageCreate", accrualPoints);

// todo: Обробник подій який додає бали якщо у голосову чаті присутні щонайменше четверо осіб
// client.on("ready", (interaction) => getMembersInVoiceChanel(interaction));
client.on("ready", () => {
  const voiceChannels = client.channels.cache.filter(
    (channel) => channel.type === "voice"
  );
  console.log(voiceChannels);
});


client.login(TOKEN);

