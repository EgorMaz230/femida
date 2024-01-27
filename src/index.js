const {
    Client,
    GatewayIntentBits,
    Guild,
    Routes,
    Events,
    Collection,
    EmbedBuilder,
    Partials
} = require("discord.js");
const { config } = require("dotenv");
const accrualPoints = require("./utils/messages.js");
const getMembersInVoiceChanel = require("./utils/voicechanel.js");

// >>>>>>> main
const { default: mongoose } = require("mongoose");
const Level = require("./models/Level");

// const { REST } = require( "@discordjs/rest");
const fs = require("node:fs");
const path = require("node:path");

config();

const TOKEN = process.env.TOKEN;
// const CLIENT_ID = process.env.CLIENT_ID;
// const GUILD_ID = process.env.GUILD_ID;

const { MongoClient } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = "messages";

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

client.on("ready", async() => {
    console.log(`${client.user.tag} is online`);
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");
    } catch (error) {
        console.log(`There was an error whil connecting to database ${error}`);
    }
});

// <<<<<<< top
client.on(Events.InteractionCreate, async(interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const currentUsers = await Level.find({ userId: interaction.user.id });
    // console.log(currentUsers)

    if (currentUsers.length === 0) {
        const newUser = new Level({
            userId: interaction.user.id,
            guildId: interaction.guild.id,
            xp: 0,
            level: 1,
        });
        console.log("some");
        // console.log(await newUser.save())
        await newUser.save();
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

//todo: Nitro boost event

client.on(Events.GuildMemberUpdate, async(oldMember, newMember) => {
    if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
        if (!oldMember.roles.cache.has("1192072016866574386") &&
            newMember.roles.cache.has("1192072016866574386")
        ) {
            const userId = newMember.user.id;

            //? Adding XP for boost

            const userData = await Level.findOne({ userId: userId });
            console.log(userData);

            const updatedXp = userData.xp + 50;

            await Level.findOneAndUpdate({ userId: userId }, { xp: updatedXp });

            //? Sending a message of boost into the system channel

            const titleChoose = [
                "Unexpected boost!",
                "Pleasant boost!",
                "Surprising boost!",
            ][Math.floor(Math.random() * 3)];

            const userIcon = `https://cdn.discordapp.com/avatars/${userId}/${newMember.user.avatar}.png?size=256`;
            const boostEmbed = new EmbedBuilder()
                .setColor("#f47fff")
                .setTitle(titleChoose)
                .setDescription(
                    `<@${userId.toString()}> has just boosted this server!\n+50 XP`
                )
                .setAuthor({
                    name: newMember.user.username,
                    iconURL: userIcon,
                })
                .setTimestamp();

            client.guilds.cache.first().systemChannel.send({
                embeds: [boostEmbed],
            });
        }
    }
});

// todo: Обробник подій який додає бали якщо у голосову чаті присутні щонайменше четверо осіб
// client.on("ready", (interaction) => getMembersInVoiceChanel(interaction));

// todo: Обробник подій який додає бали якщо у голосову чаті присутні щонайменше четверо осіб
client.on("voiceStateUpdate", (oldState, newState) => {
    const voiceChannels = client.channels.cache.filter((elem) => elem.type === 2);
    const arrObj = [];
    // console.log("newstateid", newState.channelId);

    voiceChannels.forEach((voiceChannel) => {
        arrObj.push(voiceChannel.members);
    });

    async function fetchMembers() {
        let voiceChannel = {};
        await client.channels
            .fetch(newState.channelId)
            .then((channel) => (voiceChannel = channel))
            .catch((err) => console.log(err));

        const members = voiceChannel.members;
        const userIds = members.map((member) => member.user.id);

        userIds.forEach(async(user) => {
            const people = await Level.findOne({ userId: user });
            const updateXp = people.xp + 0.5;
            await Level.findOneAndUpdate({ userId: user }, { xp: updateXp });
            if (people.xp >= 100) {
                const updtaeLevel = people.level + 1;
                const addXp = 100 - people.xp;
                await Level.findOneAndUpdate({ userId: user }, { level: updtaeLevel, xp: addXp });
            }
            console.log("people", people);
        });
    }

    if (arrObj.length >= 4) {
        fetchMembers();
    }
});

// Кодд Олександра >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>





const messages = require("./models/messages.js");

// Створення об'єкту для обробки спаму
const antiSpam = {
    warnThreshold: 3, // Кількість повідомлень підряд, що спричинять попередження
    muteTreshold: 6, // Кількість повідомлень підряд, що спричинять заглушення
    kickTreshold: 9, // Кількість повідомлень підряд, що спричинять вилучення з сервера
    banTreshold: 12, // Кількість повідомлень підряд, що спричинять заборону
    warnMessage: "Stop spamming!", // Повідомлення при попередженні користувача
    muteMessage: "You have been muted for spamming!", // Повідомлення при заглушенні користувача
    kickMessage: "You have been kicked for spamming!", // Повідомлення при вилученні з сервера користувача
    banMessage: "You have been banned for spamming!", // Повідомлення при забороні користувачу
    unMuteTime: 60, // Час в хвилинах до зняття заглушення користувача
    verbose: true, // Чи логувати кожну дію в консоль
    removeMessages: true, // Чи видаляти всі повідомлення від користувача
    // Якщо користувач має ці дозволи, ігнорувати його

}



// Функція для очищення бази даних
async function clearDatabase() {
    try {
        await messages.deleteMany({})
        console.log("База даних очищена.");
    } catch (error) {
        console.error("Помилка при очищенні бази даних:", error);
    }
}

// Функція для запуску таймера очищення бази даних
function startClearDatabaseInterval() {
    clearDatabaseInterval = setInterval(clearDatabase, 60000);
}



antiSpam.messageCount = new Map();
const userMuteCooldowns = new Map();
const userCooldowns = new Map();


client.on("messageCreate", async(message) => {
    // Перевірка, чи автор повідомлення не є ботом
    if (message.author.bot) return;

    // Отримання ідентифікатора користувача та тексту повідомлення
    const userId = message.author.id;
    const content = message.content;

    try {
        // Отримання часу останнього повідомлення користувача
        const lastMessageTime = userCooldowns.get(userId) || 0;
        const currentTime = Date.now();

        // Збереження нового повідомлення в базі даних
        const newMessage = new messages({
            userId: userId,
            message: content,
        });
        await newMessage.save();
        console.log(`User wrote: ${content}`);

        // Перевірка наявності користувача в списку cooldowns
        if (!userCooldowns.has(userId)) {
            // Додавання користувача до списку cooldowns та встановлення таймауту
            userCooldowns.set(userId, currentTime);

            setTimeout(async() => {
                // Отримання кількості аналогічних повідомлень користувача
                const countOfSameMessages = await messages.countDocuments({
                    userId: userId,
                    message: content,
                });

                // Отримання повідомлень користувача на каналі
                const userMessages = await message.channel.messages.fetch({ limit: 100 });
                // Фільтрація спам-повідомлень користувача
                const userSpamMessages = userMessages.filter((msg) => msg.author.id === userId && msg.content === content && msg.id !== message.id);

                // Видалення спам-повідомлень
                userSpamMessages.forEach(async(msg) => {
                    try {
                        await msg.delete();
                    } catch (error) {
                        console.error("Error deleting message:", error);
                    }
                });

                // Визначення дій в залежності від кількості аналогічних повідомлень
                if (countOfSameMessages >= antiSpam.warnThreshold) {
                    switch (true) {
                        case countOfSameMessages >= antiSpam.banTreshold:

                            message.channel.send(antiSpam.banMessage);
                            // Отримання об'єкта користувача
                            // const bannedUser = message.guild.members.cache.get(userId);
                            // // Блокування користувача на сервері
                            // bannedUser.ban({ reason: 'Excessive spam' });
                            break;
                        case countOfSameMessages >= antiSpam.kickTreshold:

                            // message.channel.send(antiSpam.kickMessage);
                            // const kickedUser = message.guild.members.cache.get(userId);
                            // // Вилучення користувача з серверу
                            // kickedUser.kick({ reason: 'Excessive spam' });
                            break;
                        case countOfSameMessages >= antiSpam.muteTreshold:
                            // Встановлення ролі "Muted" та часу мута
                            const lastMuteTime = userMuteCooldowns.get(userId) || 0;
                            const muteCooldown = 60 * 1000; // 1 хвилина

                            if (currentTime - lastMuteTime > muteCooldown) {
                                const muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
                                if (muteRole) {
                                    const member = message.guild.members.cache.get(userId);
                                    if (member) {
                                        member.roles.add(muteRole);
                                        message.channel.send(`<@${userId}> ${antiSpam.muteMessage}`);

                                        userMuteCooldowns.set(userId, currentTime);

                                        // Зняття ролі "Muted" після вказаного часу
                                        setTimeout(() => {
                                            member.roles.remove(muteRole);
                                        }, antiSpam.unMuteTime * 1000);
                                    }
                                }
                            }
                            break;
                        case countOfSameMessages >= antiSpam.warnThreshold:
                            // Надсилання попередження та віднімання деякої кількості досвіду (XP)
                            message.channel.send(antiSpam.warnMessage);
                            const id = message.author.id;
                            Level.findOne({ userId: id })
                                .exec()
                                .then((op) => {
                                    if (op !== null) {
                                        let exp = op.xp - 5;
                                        Level.updateOne({ userId: id }, { xp: exp }).then();
                                        console.log('Points deducted');
                                    }
                                });
                            break;
                        default:
                            break;
                    }
                }

                // Видалення користувача зі списку cooldowns
                userCooldowns.delete(userId);
            }, 1000);
        }

        // Додавання користувача до списку cooldowns
        userCooldowns.set(userId, currentTime);
    } catch (error) {
        console.error("Error saving message:", error);
    }
});
// Запускаємо таймер очищення бази даних при старті програми
startClearDatabaseInterval();










client.on("messageCreate", async(message) => {
    if (message.author.bot || !message.content) return;

    // Перевірка, чи є прикріплені файли (фото)
    if (message.attachments.size > 0) {
        client.on("messageDelete", async(msg) => {
            const id = msg.author.id;
            Level.findOne({ userId: id })
                .exec()
                .then((op) => {
                    if (op !== null) {
                        let exp = op.xp - 1;
                        Level.updateOne({ userId: id }, { xp: exp }).then();
                    }
                });
        });

        message.reply("Вам не нараховано XP через відправлене фото.");

        client.on("messageDelete", async(msg) => {
            const id = msg.author.id;
            const seconds = (Date.now() - msg.createdTimestamp) / 1000;
            const mins = seconds / 60;
            const hours = mins / 60;
            const days = hours / 24;
            const weeks = days / 7;
            if (weeks <= 1) {
                Level.findOne({ userId: id })
                    .exec()
                    .then((op) => {
                        if (op !== null) {
                            let exp = op.xp - 1;
                            Level.updateOne({ userId: id }, { xp: exp }).then();
                        }
                    });
            }
        });


        const userId = message.author.id;
        const userLevel = await Level.findOne({ userId });
        if (userLevel !== null) {
            const exp = userLevel.xp - 1;
            await Level.updateOne({ userId: userId }, { xp: exp });
            console.log(`Зменшено XP користувача ${userId} через відправлене фото.`);
        }

        return;
    }
});
client.on("messageDelete", async(msg) => {
    const id = msg.author.id;
    Level.findOne({ userId: id })
        .exec()
        .then((op) => {
            if (op !== null) {
                let exp = op.xp - 1;
                Level.updateOne({ userId: id }, { xp: exp }).then();
            }
        });
});

//////////////////////////////////////////////////////////////////////////// Egor code

const badWords = ["bad_word1", "bad_word2"];
const mutedUsers = new Map();
const muteDuration = 12000; // 10 min

client.on("messageCreate", async(message) => {
    if (message.author.bot) return; // Ignore messages from bots

    const userId = message.author.id;

    // Check if the user is currently muted
    if (mutedUsers.has(userId)) {
        const unmuteTime = mutedUsers.get(userId);
        if (unmuteTime > Date.now()) {
            await message.reply(
                "Ви ще маєте діючий м'ют. Будь ласка, залишайтеся відсутнім(ою) від нецензурних слів."
            );
            await message.delete();
            return;
        }
    }

    // Check for bad words
    let containsBadWord = false;
    for (const badWord of badWords) {
        if (message.content.toLowerCase().includes(badWord)) {
            containsBadWord = true;
            break;
        }
    }

    if (containsBadWord) {
        await message.reply(
            "Це повідомлення було видалено через те, що воно містить нецензурне слово. Будь ласка, утримайтеся від використання такої мови."
        );
        await message.delete();

        const violations = (mutedUsers.get(userId) || 0) + 1;
        if (violations >= 2) {
            mutedUsers.set(userId, Date.now() + muteDuration); // Mute the user
            await message.channel.send(
                `Користувач @${message.author.tag} був замутений на ${(
          muteDuration / 60000
        ).toFixed(2)} хвилин за використання нецензурної мови.`
            );
        } else {
            mutedUsers.set(userId, violations);
        }
        console.log(mutedUsers);
    }
});

//////////////////////////////////////////////////////////////////////////// Egor code
client.login(TOKEN);