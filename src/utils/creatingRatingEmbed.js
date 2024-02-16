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
      // value: `XP: ${user.xp}\nLevel: ${user.level}`,
      __level: user.level,
      __xp: user.xp,
      inline: true,
    };
  });
  const sortedUsersArrEmbed = usersArrEmbed.sort(
    (firstUser, secondUser) => secondUser.__xp - firstUser.__xp
  );

  if (sortedUsersArrEmbed.length > 10) {
    sortedUsersArrEmbed.splice(9, sortedUsersArrEmbed.length - 9);
  }

  const usernamesArr = sortedUsersArrEmbed.reduce((acc, { name }) => {
    acc.push(
      `\`${acc.length + 1}\` ${
        name.length > 20 ? name.slice(0, 19) + "..." : name
      }\n\n`
    );
    return acc;
  }, []);

  const levelsArr = sortedUsersArrEmbed.map(
    ({ __level }) => `\`${__level}\`\n\n`
  );
  const xpArr = sortedUsersArrEmbed.map(({ __xp }) => `\`${__xp}\`\n\n`);

  let ratingEmbed = new EmbedBuilder()
    .setColor("Yellow")
    .setTitle("Щомісячний рейтинг участників")
    .setImage(
      "https://tickikids.ams3.cdn.digitaloceanspaces.com/z1.cache/gallery/organizations/1756/image_5dc568cd5e8599.97626059.jpg"
    )
    .addFields(
      { name: "Ім'я", value: usernamesArr.join(""), inline: true },
      { name: "Рівень", value: levelsArr.join(""), inline: true },
      { name: "XP", value: xpArr.join(""), inline: true }
    );

  return ratingEmbed;
};
