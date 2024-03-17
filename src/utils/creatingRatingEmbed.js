const Level = require("../models/Level");
const getUsersByIds = require("./getUsersByIds");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client) => {
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
  const usersArrEmbed = usersData.map((user) => {
    const userName = usersObjs.find(
      (userObj) => userObj.id === user.userId
    ).displayName;
    return {
      name: userName,
      __level: user.level,
      __xp: user.xp,
      inline: true,
    };
  });
  let sortedUsersArrEmbed = usersArrEmbed
    .sort((firstUser, secondUser) => {
      if (firstUser.__level !== secondUser.__level) {
        return secondUser.__level - firstUser.__level;
      }
      return secondUser.__xp - firstUser.__xp;
    })
    .filter((user) => user.__xp >= 5 || user.__level > 1);

  if (sortedUsersArrEmbed.length > 10) {
    sortedUsersArrEmbed.splice(9, sortedUsersArrEmbed.length - 9);
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
};