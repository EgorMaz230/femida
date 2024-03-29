const {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder,
} = require("discord.js");
const Level = require("../../models/Level");
const getUsersByIds = require("../../utils/getUsersByIds");
const paginationFn = require("../../utils/pagination");

async function sendError(interaction, description) {
  const errorEmbed = new EmbedBuilder()
    .setTitle("Помилка")
    .setColor("#D04848")
    .setDescription(description)
    .setThumbnail("attachment://catError.gif");
  const attachments = [
    new AttachmentBuilder("src/imgs/catError.gif", "catError.gif"),
  ];
  await interaction
    .editReply({
      files: attachments,
      embeds: [errorEmbed],
    })
    .catch((err) => console.log(err));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaders")
    .setDescription("Надсилає рейтинг учасників серверу"),
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const usersData = await Level.find({});
      if (usersData.length === 0) {
        await sendError(
          interaction,
          "Трапилася дивна помилка. Даза даних пуста"
        );
        return;
      }
      const usersIds = usersData.map((user) => user.userId);
      const usersObjs = await getUsersByIds(usersIds, client);

      const usersArrEmbed = usersData.reduce((acc, user) => {
        let userName = usersObjs.find(
          (userObj) => userObj.id === user.userId
        );
        !!userName ? userName = userName.displayName : null;
        if (user.xp >= 5 && userName) {
          acc.push({
            name: userName,
            __level: user.level,
            __xp: user.xp,
            inline: true,
          });
          
        }
        return acc;
      }, []);
      const sortedUsersArrEmbed = usersArrEmbed
        .sort((firstUser, secondUser) => {
          if (firstUser.__level !== secondUser.__level) {
            return secondUser.__level - firstUser.__level;
          }
          return secondUser.__xp - firstUser.__xp;
        });

      if (sortedUsersArrEmbed.length === 0) {
        await sendError(
          interaction,
          "Трапилася дивна помилка. На цьому сервері ймовірно \n немає користувачів з XP більше 4"
        );
        return;
      }

      const fieldsArr = sortedUsersArrEmbed.reduce(
        (acc, { name, __xp, __level }) => {
          acc.push({
            name: `#${acc.length + 1} ` + name.trim(),
            value: `Рівень: \`${__level}\`  XP: \`${__xp}\``,
          });
          return acc;
        },
        []
      );

      let embedsArr = [];
      const size = 10;
      if (sortedUsersArrEmbed.length >= size) {
        const subarrays = [];
        for (let i = 0; i < Math.ceil(fieldsArr.length / size); i++) {
          subarrays[i] = fieldsArr.slice(i * size, (i + 1) * size);
        }

        embedsArr = Promise.all(
          subarrays.map(async (page) => {
            return new EmbedBuilder()
              .setTitle("Рейтинг учасників серверу")
              .setColor("#FFD23F")
              .addFields(...page)
              .setThumbnail(
                client.guilds.cache
                  .get(await usersData[0].guildId)
                  .iconURL({ dynamic: true })
              );
          })
        );
      } else {
        embedsArr.push(
          new EmbedBuilder()
            .setTitle("Рейтинг учасників серверу")
            .setColor("#FFD23F")
            .addFields(...fieldsArr)
            .setThumbnail(
              client.guilds.cache
                .get(await usersData[0].guildId)
                .iconURL({ dynamic: true })
            )
        );
      }
      await paginationFn(interaction, await embedsArr);
    } catch (err) {
      await sendError(
        interaction,
        "Трапилася дуууже дивна помилка. \n За можливості зверніться до адміністрації серверу"
      );
      console.log(`[LEADERS CMD ERROR] ${err}`);
    }
  },
};
