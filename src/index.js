const {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  Collection,
} = require("discord.js");
const { config } = require("dotenv");
const path = require("node:path");
const fs = require("node:fs");

// імпорти функцій
const addNewMember = require("./interactions/addNewMember.js");
const accrualPoints = require("./interactions/messages.js");
const badWords = require("./interactions/badWords.js");
const checkRoleInVc = require("./interactions/check-role-in-vc.js");
const database = require("./interactions/database.js");
const fetchInvites = require("./interactions/fetchInvites.js");
const getInteractionCommands = require("./interactions/getInteractionCommands.js");
const imageMessage = require("./interactions/imageMessage.js");
const limitPoints = require("./interactions/limitPoints.js");
const sendRatingEveryMonth = require("./interactions/sendRatingEveryMonth.js");
const startClearDatabaseInterval = require("./interactions/startClearDatabase.js");
const updateInvites = require("./interactions/updateInvites.js");
const useAntispam = require("./interactions/useAntispam.js");
const voiceStateUpdate = require("./interactions/voiseStateUpdate.js");
const whenBoost = require("./interactions/whenBoost.js");
const whenMessageDelete = require("./interactions/whenMessageDelete.js");
const helpCmd = require("../src/commands/slashCommands/help.js");

// імпорт констант

// ініціалізація клієнту

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildInvites,
  ],
  partials: [Partials.Channel],
});

// зчитування папок із слеш функціями

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


config()


client.on("ready", async (op) => {
  database(client);
  fetchInvites(op, client);
});

limitPoints();
sendRatingEveryMonth(client);
startClearDatabaseInterval();
antiSpam.messageCount = new Map();

const TOKEN = process.env.TOKEN;

// взаємодія з юзером

client.on("guildMemberAdd", async (person) => {
  updateInvites(person, client);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  addNewMember(interaction);

  getInteractionCommands(interaction);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;


  accrualPoints(message);
  useAntispam(message);
  imageMessage(message);
  badWords(message);
});


client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  whenBoost(oldMember, newMember, client);
});

client.on("voiceStateUpdate", (oldState, newState) => {
  addNewMember(false, false, newState);
  voiceStateUpdate(oldState, newState, client);
  checkRoleInVc(oldState, newState, client);
});

client.on("messageDelete", async (msg) => {
  whenMessageDelete(msg);
});

client.login(TOKEN);
