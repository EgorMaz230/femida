const {
  Client,
  GatewayIntentBits,
  Guild,
  Routes,
  Events,
    Collection,
  EmbedBuilder
} = require("discord.js");
const { config } = require("dotenv");
const accrualPoints = require("./utils/messages.js");
const getMembersInVoiceChanel = require("./utils/voicechanel.js");
const cron = require("cron");
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
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");
  } catch (error) {
    console.log(`There was an error whil connecting to database ${error}`);
  }
});

// <<<<<<< top
client.on(Events.InteractionCreate, async (interaction) => {
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

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
    if (
      !oldMember.roles.cache.has("1192072016866574386") &&
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

    userIds.forEach(async (user) => {
      const people = await Level.findOne({ userId: user });
      const updateXp = people.xp + 0.5;
      await Level.findOneAndUpdate({ userId: user }, { xp: updateXp });
      if (people.xp >= 100) {
        const updtaeLevel = people.level + 1;
        const addXp = 100 - people.xp;
        await Level.findOneAndUpdate(
          { userId: user },
          { level: updtaeLevel, xp: addXp }
        );
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

// client.on("ready", async() => {
//     try {
//         // Створення та підключення до об'єкта MongoDB
//         const dbClient = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
//         await dbClient.connect();
//         console.log('Connected to DB');

//         // Призначте dbClient глобальній змінній, щоб можна було його використовувати в інших частинах коду
//         global.dbClient = dbClient;
//     } catch (error) {
//         console.log(`There was an error while connecting to the database: ${error}`);
//     }
// });

// ...

const spamCooldown = 60000; // період часу для визначення спаму в мілісекундах (тут 60 секунд)
const maxSameMessages = 3; // максимальна кількість однакових повідомлень для спаму

const userCooldowns = new Map();

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;
  const content = message.content;

  try {
    // Збереження нового повідомлення в базу даних
    const newMessage = new messages({
      userId: userId,
      message: content,
    });
    await newMessage.save();
    console.log(`Користувач написав: ${content}`);

    const countOfSameMessages = await messages.countDocuments({
      userId: userId,
      message: content,
    });

    // Перевірка на спам за інтервалом часу
    if (userCooldowns.has(userId)) {
      const timeDiff = Date.now() - userCooldowns.get(userId);
      if (timeDiff < spamCooldown && countOfSameMessages >= maxSameMessages) {
        // Якщо користувач відправляє більше 3 однакових повідомлень за короткий інтервал часу, зменшуємо його досвід
        const userLevel = await Level.findOne({ userId });
        if (userLevel !== null) {
          const exp = userLevel.xp - 1;
          await Level.updateOne({ userId: userId }, { xp: exp });
          console.log(`Зменшено досвід користувача ${userId} через спам.`);
          message.reply(
            `Ви відправили ${countOfSameMessages} однакових повідомлень. Зменшено XP через спам`
          );
        }
        return;
      }
    }

    // Оновлюємо час останнього відправленого повідомлення для користувача
    userCooldowns.set(userId, Date.now());
  } catch (error) {
    console.error("Помилка при збереженні:", error);
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content) return;

  // Перевірка, чи є прикріплені файли (фото)
  if (message.attachments.size > 0) {
    client.on("messageDelete", async (msg) => {
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

client.on("messageDelete", async (msg) => {
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
client.on("messageDelete", async (msg) => {
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

client.on("messageCreate", async (message) => {
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

//todo: Monthly rating

async function getUsersByIds(usersIds) {
  let guildId = await Level.find({});
  guildId = guildId[0].guildId;
  const guild = client.guilds.cache.get(guildId);

  try {
    const usersArr = [];
    await Promise.all(
      usersIds.map(async (userId) => {
        try {
          const member = await guild.members.fetch(userId);
          usersArr.push(member.user);
        } catch (error) {
          console.error(
            `Error fetching user with ID ${userId}:`,
            error.message
          );
        }
      })
    );

    return usersArr;
  } catch (error) {
    console.error("Error fetching users:", error.message);
    throw error;
  }
}

async function creatingRatingEmbed() {
  const usersData = await Level.find({});
  const usersIds = usersData.map((user) => user.userId);
  const usersObjs = await getUsersByIds(usersIds);
  const usersArrEmbed = usersData.map((user) => {
    const userName = usersObjs.find(
      (userObj) => userObj.id === user.userId
    ).displayName;
    return {
      name: userName,
      value: `XP: ${user.xp}\nLevel: ${user.level}`,
      // __level: user.level,
      __xp: user.xp,
    };
  });
  const sortedUsersArrEmbed = usersArrEmbed.sort(
    (firstUser, secondUser) => secondUser.__xp - firstUser.__xp
  );
  const ratingEmbed = new EmbedBuilder()
    .setColor("Yellow")
    .setTitle("Щомісячний рейтинг участників")
    .addFields(...sortedUsersArrEmbed);
  return ratingEmbed;
}

async function sendRatingEveryMonth() {
  const ratingEmbed = await creatingRatingEmbed();

  const sendRatingFn = async () => {
    client.channels
      .fetch("1192080421677191288")
      .then((channel) => channel.send({ embeds: [ratingEmbed] }));
  };
  const sendRatingJob = new cron.CronJob("00 00 10 * * *", sendRatingFn);
  sendRatingJob.start();
}

sendRatingEveryMonth();

client.login(TOKEN);
