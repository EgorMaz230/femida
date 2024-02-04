const {
  Client,
  GatewayIntentBits,
  Guild,
  Routes,
  Events,
  Collection,
  EmbedBuilder,
  Partials,
} = require("discord.js");
const { config } = require("dotenv");
const accrualPoints = require("./utils/messages.js");
const getMembersInVoiceChanel = require("./utils/voicechanel.js");
const database = require("./utils/database.js");
const cron = require("cron");
const antispam = require("./utils/antispam.js");
// >>>>>>> main
const { default: mongoose } = require("mongoose");
const Level = require("./models/Level");
const addNewMember = require("./utils/addNewMember.js");
const voiceStateUpdate = require("./utils/voiseStateUpdate.js");
const useAntispam = require("./utils/useAntispam.js");

const imageMessage = require("./utils/imageMessage.js");

const whenBoost = require("./utils/whenBoost.js");

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
};

antiSpam.messageCount = new Map();

// const { REST } = require( "@discordjs/rest");
const fs = require("node:fs");
const path = require("node:path");

// const userMuteCooldowns = new Map();
// const userCooldowns = new Map();

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

client.on("ready", async () => {
  database(client);
  // console.log(`${client.user.tag} is online`);
  // try {
  //     await mongoose.connect(process.env.MONGODB_URI);
  //     console.log("Connected to DB");
  // } catch (error) {
  //     console.log(`There was an error whil connecting to database ${error}`);
  // }
});

// <<<<<<< top
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

//todo: Обробник подій який додає бали за повідомлення довші за 3 літери
client.on("messageCreate", accrualPoints);

//todo: Nitro boost event

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  whenBoost(oldMember, newMember, client);
  // if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
  //     if (!oldMember.roles.cache.has("1192072016866574386") &&
  //         newMember.roles.cache.has("1192072016866574386")
  //     ) {
  //         const userId = newMember.user.id;

  //         //? Adding XP for boost

  //         const userData = await Level.findOne({ userId: userId });
  //         console.log(userData);

  //         const updatedXp = userData.xp + 50;

  //         await Level.findOneAndUpdate({ userId: userId }, { xp: updatedXp });

  //         //? Sending a message of boost into the system channel

  //         const titleChoose = [
  //             "Unexpected boost!",
  //             "Pleasant boost!",
  //             "Surprising boost!",
  //         ][Math.floor(Math.random() * 3)];

  //         const userIcon = `https://cdn.discordapp.com/avatars/${userId}/${newMember.user.avatar}.png?size=256`;
  //         const boostEmbed = new EmbedBuilder()
  //             .setColor("#f47fff")
  //             .setTitle(titleChoose)
  //             .setDescription(
  //                 `<@${userId.toString()}> has just boosted this server!\n+50 XP`
  //             )
  //             .setAuthor({
  //                 name: newMember.user.username,
  //                 iconURL: userIcon,
  //             })
  //             .setTimestamp();

  //         client.guilds.cache.first().systemChannel.send({
  //             embeds: [boostEmbed],
  //         });
  //     }
  // }
});

// todo: Обробник подій який додає бали якщо у голосову чаті присутні щонайменше четверо осіб
// client.on("ready", (interaction) => getMembersInVoiceChanel(interaction));

// todo: Обробник подій який додає бали якщо у голосову чаті присутні щонайменше четверо осіб
client.on("voiceStateUpdate", (oldState, newState) => {
  voiceStateUpdate(oldState, newState, client);
  // voiseStateUpdate(client, newState)
  // const voiceChannels = client.channels.cache.filter((elem) => elem.type === 2);
  // const arrObj = [];
  // // console.log("newstateid", newState.channelId);

  // voiceChannels.forEach((voiceChannel) => {
  //     arrObj.push(voiceChannel.members);
  // });

  // async function fetchMembers() {
  //     let voiceChannel = {};
  //     await client.channels
  //         .fetch(newState.channelId)
  //         .then((channel) => (voiceChannel = channel))
  //         .catch((err) => console.log(err));

  //     const members = voiceChannel.members;
  //     const userIds = members.map((member) => member.user.id);

  //     userIds.forEach(async(user) => {
  //         const people = await Level.findOne({ userId: user });
  //         const updateXp = people.xp + 0.5;
  //         await Level.findOneAndUpdate({ userId: user }, { xp: updateXp });
  //         if (people.xp >= 100) {
  //             const updtaeLevel = people.level + 1;
  //             const addXp = 100 - people.xp;
  //             await Level.findOneAndUpdate({ userId: user }, { level: updtaeLevel, xp: addXp });
  //         }
  //         console.log("people", people);
  //     });
  // }

  // if (arrObj.length >= 4) {
  //     fetchMembers();
  // }
});

// Кодд Олександра >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

antispam();
// const messages = require("./models/messages.js");
// const voiseStateUpdate = require("./utils/voiseStateUpdate.js");

// Створення об'єкту для обробки спаму
// const antiSpam = {
//     warnThreshold: 3, // Кількість повідомлень підряд, що спричинять попередження
//     muteTreshold: 6, // Кількість повідомлень підряд, що спричинять заглушення
//     kickTreshold: 9, // Кількість повідомлень підряд, що спричинять вилучення з сервера
//     banTreshold: 12, // Кількість повідомлень підряд, що спричинять заборону
//     warnMessage: "Stop spamming!", // Повідомлення при попередженні користувача
//     muteMessage: "You have been muted for spamming!", // Повідомлення при заглушенні користувача
//     kickMessage: "You have been kicked for spamming!", // Повідомлення при вилученні з сервера користувача
//     banMessage: "You have been banned for spamming!", // Повідомлення при забороні користувачу
//     unMuteTime: 60, // Час в хвилинах до зняття заглушення користувача
//     verbose: true, // Чи логувати кожну дію в консоль
//     removeMessages: true, // Чи видаляти всі повідомлення від користувача
//     // Якщо користувач має ці дозволи, ігнорувати його

// }

// // Функція для очищення бази даних
// async function clearDatabase() {
//     try {
//         await messages.deleteMany({})
//         console.log("База даних очищена.");
//     } catch (error) {
//         console.error("Помилка при очищенні бази даних:", error);
//     }
// }

// // Функція для запуску таймера очищення бази даних
// function startClearDatabaseInterval() {
//     clearDatabaseInterval = setInterval(clearDatabase, 60000);
// }

// antiSpam.messageCount = new Map();
const userMuteCooldowns = new Map();
const userCooldowns = new Map();

client.on(
  "messageCreate",
  async (message) => {
    // Перевірка, чи автор повідомлення не є ботом
    if (message.author.bot) return;

    useAntispam(message, antiSpam, userCooldowns, userMuteCooldowns);

    // // Отримання ідентифікатора користувача та тексту повідомлення
    // const userId = message.author.id;
    // const content = message.content;

    // try {
    //     // Отримання часу останнього повідомлення користувача
    //     const lastMessageTime = userCooldowns.get(userId) || 0;
    //     const currentTime = Date.now();

    //     // Збереження нового повідомлення в базі даних
    //     const newMessage = new messages({
    //         userId: userId,
    //         message: content,
    //     });
    //     await newMessage.save();
    //     console.log(`User wrote: ${content}`);

    //     // Перевірка наявності користувача в списку cooldowns
    //     if (!userCooldowns.has(userId)) {
    //         // Додавання користувача до списку cooldowns та встановлення таймауту
    //         userCooldowns.set(userId, currentTime);

    //         setTimeout(async() => {
    //             // Отримання кількості аналогічних повідомлень користувача
    //             const countOfSameMessages = await messages.countDocuments({
    //                 userId: userId,
    //                 message: content,
    //             });

    //             // Отримання повідомлень користувача на каналі
    //             const userMessages = await message.channel.messages.fetch({ limit: 100 });
    //             // Фільтрація спам-повідомлень користувача
    //             const userSpamMessages = userMessages.filter((msg) => msg.author.id === userId && msg.content === content && msg.id !== message.id);

    //             // Видалення спам-повідомлень
    //             userSpamMessages.forEach(async(msg) => {
    //                 try {
    //                     await msg.delete();
    //                 } catch (error) {
    //                     console.error("Error deleting message:", error);
    //                 }
    //             });

    //             // Визначення дій в залежності від кількості аналогічних повідомлень
    //             if (countOfSameMessages >= antiSpam.warnThreshold) {
    //                 switch (true) {
    //                     case countOfSameMessages >= antiSpam.banTreshold:

    //                         message.channel.send(antiSpam.banMessage);
    //                         // Отримання об'єкта користувача
    //                         // const bannedUser = message.guild.members.cache.get(userId);
    //                         // // Блокування користувача на сервері
    //                         // bannedUser.ban({ reason: 'Excessive spam' });
    //                         break;
    //                     case countOfSameMessages >= antiSpam.kickTreshold:

    //                         // message.channel.send(antiSpam.kickMessage);
    //                         // const kickedUser = message.guild.members.cache.get(userId);
    //                         // // Вилучення користувача з серверу
    //                         // kickedUser.kick({ reason: 'Excessive spam' });
    //                         break;
    //                     case countOfSameMessages >= antiSpam.muteTreshold:
    //                         // Встановлення ролі "Muted" та часу мута
    //                         const lastMuteTime = userMuteCooldowns.get(userId) || 0;
    //                         const muteCooldown = 60 * 1000; // 1 хвилина

    //                         if (currentTime - lastMuteTime > muteCooldown) {
    //                             const muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
    //                             if (muteRole) {
    //                                 const member = message.guild.members.cache.get(userId);
    //                                 if (member) {
    //                                     member.roles.add(muteRole);
    //                                     message.channel.send(`<@${userId}> ${antiSpam.muteMessage}`);

    //                                     userMuteCooldowns.set(userId, currentTime);

    //                                     // Зняття ролі "Muted" після вказаного часу
    //                                     setTimeout(() => {
    //                                         member.roles.remove(muteRole);
    //                                     }, antiSpam.unMuteTime * 1000);
    //                                 }
    //                             }
    //                         }
    //                         break;
    //                     case countOfSameMessages >= antiSpam.warnThreshold:
    //                         // Надсилання попередження та віднімання деякої кількості досвіду (XP)
    //                         message.channel.send(antiSpam.warnMessage);
    //                         const id = message.author.id;
    //                         Level.findOne({ userId: id })
    //                             .exec()
    //                             .then((op) => {
    //                                 if (op !== null) {
    //                                     let exp = op.xp - 5;
    //                                     Level.updateOne({ userId: id }, { xp: exp }).then();
    //                                     console.log('Points deducted');
    //                                 }
    //                             });
    //                         break;
    //                     default:
    //                         break;
    //                 }
    //             }

    //             // Видалення користувача зі списку cooldowns
    //             userCooldowns.delete(userId);
    //         }, 1000);
    // }

    // // Отримання ідентифікатора користувача та тексту повідомлення
    // const userId = message.author.id;
    // const content = message.content;

    // try {
    //     // Отримання часу останнього повідомлення користувача
    //     const lastMessageTime = userCooldowns.get(userId) || 0;
    //     const currentTime = Date.now();

    //     // Збереження нового повідомлення в базі даних
    //     const newMessage = new messages({
    //         userId: userId,
    //         message: content,
    //     });
    //     await newMessage.save();
    //     console.log(`User wrote: ${content}`);

    //     // Перевірка наявності користувача в списку cooldowns
    //     if (!userCooldowns.has(userId)) {
    //         // Додавання користувача до списку cooldowns та встановлення таймауту
    //         userCooldowns.set(userId, currentTime);

    //         setTimeout(async() => {
    //             // Отримання кількості аналогічних повідомлень користувача
    //             const countOfSameMessages = await messages.countDocuments({
    //                 userId: userId,
    //                 message: content,
    //             });

    //             // Отримання повідомлень користувача на каналі
    //             const userMessages = await message.channel.messages.fetch({ limit: 100 });
    //             // Фільтрація спам-повідомлень користувача
    //             const userSpamMessages = userMessages.filter((msg) => msg.author.id === userId && msg.content === content && msg.id !== message.id);

    //             // Видалення спам-повідомлень
    //             userSpamMessages.forEach(async(msg) => {
    //                 try {
    //                     await msg.delete();
    //                 } catch (error) {
    //                     console.error("Error deleting message:", error);
    //                 }
    //             });

    //             // Визначення дій в залежності від кількості аналогічних повідомлень
    //             if (countOfSameMessages >= antiSpam.warnThreshold) {
    //                 switch (true) {
    //                     case countOfSameMessages >= antiSpam.banTreshold:

    //                         message.channel.send(antiSpam.banMessage);
    //                         // Отримання об'єкта користувача
    //                         // const bannedUser = message.guild.members.cache.get(userId);
    //                         // // Блокування користувача на сервері
    //                         // bannedUser.ban({ reason: 'Excessive spam' });
    //                         break;
    //                     case countOfSameMessages >= antiSpam.kickTreshold:

    // message.channel.send(antiSpam.kickMessage);
    // const kickedUser = message.guild.members.cache.get(userId);
    // // Вилучення користувача з серверу
    // kickedUser.kick({ reason: 'Excessive spam' });
    //                 break;
    //             case countOfSameMessages >= antiSpam.muteTreshold:
    //                 // Встановлення ролі "Muted" та часу мута
    //                 const lastMuteTime = userMuteCooldowns.get(userId) || 0;
    //                 const muteCooldown = 60 * 1000; // 1 хвилина

    //                 if (currentTime - lastMuteTime > muteCooldown) {
    //                     const muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
    //                     if (muteRole) {
    //                         const member = message.guild.members.cache.get(userId);
    //                         if (member) {
    //                             member.roles.add(muteRole);
    //                             message.channel.send(`<@${userId}> ${antiSpam.muteMessage}`);

    //                             userMuteCooldowns.set(userId, currentTime);

    //                             // Зняття ролі "Muted" після вказаного часу
    //                             setTimeout(() => {
    //                                 member.roles.remove(muteRole);
    //                             }, antiSpam.unMuteTime * 1000);
    //                         }
    //                     }
    //                 }
    //                 break;
    //             case countOfSameMessages >= antiSpam.warnThreshold:
    //                 // Надсилання попередження та віднімання деякої кількості досвіду (XP)
    //                 message.channel.send(antiSpam.warnMessage);
    //                 removePoints(message.author.id, 5);
    //                 break;
    //             default:
    //                 break;
    //         }
    //     }

    //     // Видалення користувача зі списку cooldowns
    //     userCooldowns.delete(userId);
    // }, 1000);
  }

  // Додавання користувача до списку cooldowns
  // userCooldowns.set(userId, currentTime);
  // } catch (error) {
  //     console.error("Error saving message:", error);
  // }
  // }
);
// Запускаємо таймер очищення бази даних при старті програми
// startClearDatabaseInterval();

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content) return;
  imageMessage(message);
  // Перевірка, чи є прикріплені файли (фото)

  // if (message.attachments.size > 0) {
  //     client.on("messageDelete", async(msg) => {
  //         const id = msg.author.id;
  //         Level.findOne({ userId: id })
  //             .exec()
  //             .then((op) => {
  //                 if (op !== null) {
  //                     let exp = op.xp - 1;
  //                     Level.updateOne({ userId: id }, { xp: exp }).then();
  //                 }
  //             });
  //     });

  //     message.reply("Вам не нараховано XP через відправлене фото.");

  //     client.on("messageDelete", async(msg) => {
  //         const id = msg.author.id;
  //         const seconds = (Date.now() - msg.createdTimestamp) / 1000;
  //         const mins = seconds / 60;
  //         const hours = mins / 60;
  //         const days = hours / 24;
  //         const weeks = days / 7;
  //         if (weeks <= 1) {
  //             Level.findOne({ userId: id })
  //                 .exec()
  //                 .then((op) => {
  //                     if (op !== null) {
  //                         let exp = op.xp - 1;
  //                         Level.updateOne({ userId: id }, { xp: exp }).then();
  //                     }
  //                 });
  //         }
  //     });

  //     const userId = message.author.id;
  //     const userLevel = await Level.findOne({ userId });
  //     if (userLevel !== null) {
  //         const exp = userLevel.xp - 1;
  //         await Level.updateOne({ userId: userId }, { xp: exp });
  //         console.log(`Зменшено XP користувача ${userId} через відправлене фото.`);
  //     }

  //     return;
  // }
});

const whenMessageDelete = require("./utils/whenMessageDelete.js");
client.on("messageDelete", async (msg) => {
  whenMessageDelete(msg);
  // const id = msg.author.id;
  // Level.findOne({ userId: id })
  //     .exec()
  //     .then((op) => {
  //         if (op !== null) {
  //             let exp = op.xp - 1;
  //             Level.updateOne({ userId: id }, { xp: exp }).then();
  //         }
  //     });

  //     if (message.attachments.size > 0) {
  //         removePoints(message.author.id, 1);

  //         message.reply("Вам не нараховано XP через відправлене фото.");

  //         const userId = message.author.id;
  //         const userLevel = await Level.findOne({ userId });
  //         if (userLevel !== null) {
  //             const exp = userLevel.xp - 1;
  //             await Level.updateOne({ userId: userId }, { xp: exp });
  //             console.log(`Зменшено XP користувача ${userId} через відправлене фото.`);
  //         }

  //         return;
  //     }
});

////////////////////////////////////////////Viacheslav

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
  //If msg life time is less than 1 week - remove points
  const seconds = (Date.now() - msg.createdTimestamp) / 1000;
  const mins = seconds / 60;
  const hours = mins / 60;
  const days = hours / 24;
  const weeks = days / 7;
  if (weeks <= 1) {
    removePoints(msg.author.id, 1);
  }
});
////////////////////////////////////////////Viacheslav

//////////////////////////////////////////////////////////////////////////// Egor code

// const badWords = ["bad_word1", "bad_word2"];
// const mutedUsers = new Map();
// const muteDuration = 12000; // 10 min

const badWords = require("./utils/badWords.js");

client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // Ignore messages from bots
  badWords(message);
  // const userId = message.author.id;

  // // Check if the user is currently muted
  // if (mutedUsers.has(userId)) {
  //     const unmuteTime = mutedUsers.get(userId);
  //     if (unmuteTime > Date.now()) {
  //         await message.reply(
  //             "Ви ще маєте діючий м'ют. Будь ласка, залишайтеся відсутнім(ою) від нецензурних слів."
  //         );
  //         await message.delete();
  //         return;
  //     }
  // }

  // // Check for bad words
  // let containsBadWord = false;
  // for (const badWord of badWords) {
  //     if (message.content.toLowerCase().includes(badWord)) {
  //         containsBadWord = true;
  //         break;
  //     }
  // }

  // if (containsBadWord) {
  //     await message.reply(
  //         "Це повідомлення було видалено через те, що воно містить нецензурне слово. Будь ласка, утримайтеся від використання такої мови."
  //     );
  //     await message.delete();

  //     const violations = (mutedUsers.get(userId) || 0) + 1;
  //     if (violations >= 2) {
  //         mutedUsers.set(userId, Date.now() + muteDuration); // Mute the user
  //         await message.channel.send(
  //             `Користувач @${message.author.tag} був замутений на ${(
  //       muteDuration / 60000
  //     ).toFixed(2)} хвилин за використання нецензурної мови.`
  //         );
  //     } else {
  //         mutedUsers.set(userId, violations);
  //     }
  //     console.log(mutedUsers);
  // }
});

//////////////////////////////////////////////////////////////////////////// Egor code

//todo: Monthly rating

const getUsersByIds = require("./utils/getUsersByIds.js");

// async function
// (usersIdgetUsersByIds)
// {
//   let guildId = await Level.find({});
//   guildId = guildId[0].guildId;
//   const guild = client.guilds.cache.get(guildId);

//   try {
//     const usersArr = [];
//     await Promise.all(
//       usersIds.map(async (userId) => {
//         try {
//           const member = await guild.members.fetch(userId);
//           usersArr.push(member.user);
//         } catch (error) {
//           console.error(
//             `Error fetching user with ID ${userId}:`,
//             error.message
//           );
//         }
//       })
//     );

//     return usersArr;
//   } catch (error) {
//     console.error("Error fetching users:", error.message);
//     throw error;
//   }
// }

const creatingRatingEmbed = require("./utils/creatingRatingEmbed.js");
// async function creatingRatingEmbed() {
//   const usersData = await Level.find({});
//   const usersIds = usersData.map((user) => user.userId);
//   const usersObjs = await getUsersByIds(usersIds, client);
//   const usersArrEmbed = usersData.map((user) => {
//     const userName = usersObjs.find(
//       (userObj) => userObj.id === user.userId
//     ).displayName;
//     return {
//       name: userName,
//       value: `XP: ${user.xp}\nLevel: ${user.level}`,
//       // __level: user.level,
//       __xp: user.xp,
//     };
//   });
//   const sortedUsersArrEmbed = usersArrEmbed.sort(
//     (firstUser, secondUser) => secondUser.__xp - firstUser.__xp
//   );
//   const ratingEmbed = new EmbedBuilder()
//     .setColor("Yellow")
//     .setTitle("Щомісячний рейтинг участників")
//     .addFields(...sortedUsersArrEmbed);
//   return ratingEmbed;
// }

// async function sendRatingEveryMonth() {
//   const ratingEmbed = await creatingRatingEmbed(client);

//   const sendRatingFn = async () => {
//     client.channels
//       .fetch("1192080421677191288")
//       .then((channel) => channel.send({ embeds: [ratingEmbed] }));
//   };
//   const sendRatingJob = new cron.CronJob("00 00 10 * * *", sendRatingFn);
//   sendRatingJob.start();
// }
const sendRatingEveryMonth = require("./utils/sendRatingEveryMonth.js");

sendRatingEveryMonth(client);

client.login(TOKEN);
