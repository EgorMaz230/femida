const Level = require("../models/Level");
const getUsersByIds = require("./getUsersByIds");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client) => {
  const usersData = await Level.find({});
  const usersIds = usersData.map((user) => user.userId);
  const usersObjs = await getUsersByIds(usersIds, client);
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

  if (sortedUsersArrEmbed.length > 10) {
    sortedUsersArrEmbed.splice(9, sortedUsersArrEmbed.length - 9);
  }
  const ratingEmbed = new EmbedBuilder()
    .setColor("Yellow")
    .setTitle("Щомісячний рейтинг участників")
    .addFields(...sortedUsersArrEmbed);
  return ratingEmbed;
};
