const Level = require("../models/Level");
const getUsersByIds = require("./getUsersByIds");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client) => {
  try {
    const usersData = await Level.find({});
    if (usersData.length === 0) {
      return new EmbedBuilder()
        .setTitle("Помилка")
        .setColor("#D04848")
        .setDescription("Трапилася дивна помилка. Даза даних пуста")
        .setThumbnail("attachment://catError.gif");
    }
    const usersIds = usersData.map((user) => user.userId);
    const usersObjs = await getUsersByIds(usersIds, client);
    const usersArrEmbed = usersData.reduce((acc, user) => {
      let userName = usersObjs.find((userObj) => userObj.id === user.userId);
      !!userName ? (userName = userName.displayName) : null;
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
    let sortedUsersArrEmbed = usersArrEmbed.sort((firstUser, secondUser) => {
      if (firstUser.__level !== secondUser.__level) {
        return secondUser.__level - firstUser.__level;
      }
      return secondUser.__xp - firstUser.__xp;
    });

    if (sortedUsersArrEmbed.length > 10) {
      sortedUsersArrEmbed.splice(10, sortedUsersArrEmbed.length - 10);
    }

    if (sortedUsersArrEmbed.length === 0) {
      return new EmbedBuilder()
        .setTitle("Помилка")
        .setColor("#D04848")
        .setDescription(
          "Трапилася дивна помилка. На цьому сервері ймовірно \n немає користувачів з XP більше 4"
        )
        .setThumbnail("attachment://catError.gif");
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
    const ratingEmbed = new EmbedBuilder()
      .setColor("#FFD23F")
      .setTitle("Щомісячний рейтинг участників")
      .addFields(...fieldsArr)
      .setThumbnail(
        client.guilds.cache
          .get(await usersData[0].guildId)
          .iconURL({ dynamic: true })
      );

    return ratingEmbed;
  } catch (err) {
    console.log(`[CREATE RATING EMBED ERROR] - ${err}`);
  }
};
