const Level = require("../models/Level");
const getUsersByIds = require("./getUsersByIds");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client) => {
  const usersData = await Level.find({});
  if (usersData.length === 0) {
    return new EmbedBuilder()
      .setTitle("Error")
      .setColor("#D04848")
      .setDescription("Strange error occured. Database is empty")
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
      .setTitle("Error")
      .setColor("#D04848")
      .setDescription(
        "Strange error occured. This server is probably \n do not have users more than 5 XP"
      )
      .setThumbnail("attachment://catError.gif");
  }
  //? Sorting arrays

  const usernamesArr = sortedUsersArrEmbed.reduce((acc, { name }) => {
    acc.push(
      `\`${acc.length + 1}\` ${
        name.length > 20 ? name.slice(0, 19) + "..." : name
      }\n\n`
    );
    if (acc.length === 1) {
      acc[0] = acc[0].slice(0, -2) + " " + ":first_place:" + "\n\n";
    }
    if (acc.length === 2) {
      acc[1] = acc[1].slice(0, -2) + " " + ":second_place:" + "\n\n";
    }
    if (acc.length === 3) {
      acc[2] = acc[2].slice(0, -2) + " " + ":third_place:" + "\n\n";
    }
    return acc;
  }, []);

  const levelsArr = sortedUsersArrEmbed.map(
    ({ __level }) => `\`${__level}\`\n\n`
  );
  const xpArr = sortedUsersArrEmbed.map(({ __xp }) => `\`${__xp}\`\n\n`);

  const ratingEmbed = new EmbedBuilder()
    .setColor("#FFD23F")
    .setTitle("Щомісячний рейтинг участників")
    .setImage("attachment://goiteens-logo.jpg")
    .addFields(
      { name: "Ім'я", value: usernamesArr.join(""), inline: true },
      { name: "Рівень", value: levelsArr.join(""), inline: true },
      { name: "XP", value: xpArr.join(""), inline: true }
    );

  return ratingEmbed;
};
