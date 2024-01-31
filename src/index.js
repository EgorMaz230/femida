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
const accrualPoints = require("./utils/messages.js");
const useAntispam = require("./utils/useAntispam.js");
const imageMessage = require("./utils/imageMessage.js");
const whenMessageDelete = require("./utils/whenMessageDelete.js");
const badWords = require("./utils/badWords.js");
const database = require('./utils/database.js');
const addNewMember = require("./utils/addNewMember.js");
const whenBoost = require("./utils/whenBoost.js");
const voiceStateUpdate = require("./utils/voiseStateUpdate.js");
const Level = require("./models/Level");
config();

const TOKEN = process.env.TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [Partials.Channel],
});

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
}

antiSpam.messageCount = new Map();


client.on("ready", async () => {
    database(client);
});


client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    addNewMember(interaction)

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



client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    accrualPoints(message);
    useAntispam(message, antiSpam, userCooldowns, userMuteCooldowns);
    imageMessage(message);
    whenMessageDelete(message);
    badWords(message);
});

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    whenBoost(oldMember, newMember, client);
});

client.on("voiceStateUpdate", (oldState, newState) => {
    voiceStateUpdate(client, newState);
});

const userMuteCooldowns = new Map();
const userCooldowns = new Map();





function removePoints(id, amount) {
    Level.findOne({ userId: id })
        .exec()
        .then((op) => {
            if (op !== null) {
                let exp = op.xp - amount;
                Level.updateOne({ userId: id }, { xp: exp }).then();
            }
        });
}

client.on("messageDelete", async (msg) => {
    const seconds = (Date.now() - msg.createdTimestamp) / 1000;
    const mins = seconds / 60;
    const hours = mins / 60;
    const days = hours / 24;
    const weeks = days / 7;
    if (weeks <= 1) {
        removePoints(msg.author.id, 1);
    }
});

client.login(TOKEN);