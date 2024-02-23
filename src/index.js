const limitPoints = require("./utils/limitPoints.js");

const {
    Client,
    GatewayIntentBits,
    Partials,
    Events,
    Collection,
    UserSelectMenuBuilder,
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
const getInteractionCommands = require("./interactions/getInteractionCommands.js")
const imageMessage = require("./interactions/imageMessage.js");
const limitPoints = require("./interactions/limitPoints.js");
const sendRatingEveryMonth = require("./interactions/sendRatingEveryMonth.js");
const startClearDatabaseInterval = require("./interactions/startClearDatabase.js")
const updateInvites = require("./interactions/updateInvites.js");
const useAntispam = require("./interactions/useAntispam.js");
const voiceStateUpdate = require("./interactions/voiseStateUpdate.js");
const whenBoost = require("./interactions/whenBoost.js");
const whenMessageDelete = require("./interactions/whenMessageDelete.js");

// імпорт констант

const antiSpam = require('./constants/antiSpam.js')

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

const antiSpam = {
  warnThreshold: 3,
  muteTreshold: 6,
  kickTreshold: 9,
  banTreshold: 12,
  warnMessage: "Stop spamming!",
  muteMessage: "You have been muted for spamming!",
  kickMessage: "You have been kicked for spamming!",
  banMessage: "You have been banned for spamming!",
  unMuteTime: 60,
  verbose: true,
  removeMessages: true,
};

antiSpam.messageCount = new Map();


client.on("ready", async (op) => {
  database(client);
  fetchInvites(op, client);
});

limitPoints();
sendRatingEveryMonth(client);
startClearDatabaseInterval()
antiSpam.messageCount = new Map();

const TOKEN = process.env.TOKEN;

// взаємодія з юзером

client.on("guildMemberAdd", async (person) => {
  updateInvites(person, client);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  addNewMember(interaction);

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

const messages = require("./models/messages.js");
// Функція для очищення бази даних
async function clearDatabase() {
  try {
    await messages.deleteMany({});
    console.log("База даних очищена.");
  } catch (error) {
    console.error("Помилка при очищенні бази даних:", error);
  }
}

// Функція для запуску таймера очищення бази даних
function startClearDatabaseInterval() {
  clearDatabaseInterval = setInterval(clearDatabase, 60000);
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  // Запускаємо таймер очищення бази даних при старті програми
  startClearDatabaseInterval();


client.on("messageCreate", async(message) => {
    if (message.author.bot) return;
    
    // Запускаємо таймер очищення бази даних при старті програми
    startClearDatabaseInterval();

    accrualPoints(message);
    useAntispam(message, antiSpam, userCooldowns, userMuteCooldowns);
    imageMessage(message);
    whenMessageDelete(message);
    badWords(message);

  accrualPoints(message);
  useAntispam(message, antiSpam, userCooldowns, userMuteCooldowns);
  imageMessage(message);
  whenMessageDelete(message);
  badWords(message);

});

startClearDatabaseInterval();
limitPoints();

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  whenBoost(oldMember, newMember, client);
});

client.on("voiceStateUpdate", (oldState, newState) => {
  voiceStateUpdate(oldState, newState, client);
  checkRoleInVc(oldState, newState, client);
});




const userMuteCooldowns = new Map();
const userCooldowns = new Map();

client.on("messageDelete", async (msg) => {
  whenMessageDelete(msg);
});

sendRatingEveryMonth(client);


client.login(TOKEN);
