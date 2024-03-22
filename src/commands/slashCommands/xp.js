const {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder,
} = require("discord.js");
const Level = require("../../models/Level");
const updateLevel = require("../../utils/updateLevel.js");
const { RankCardBuilder, Font } = require("canvacord");
const fs = require("node:fs");

async function createRankCard(interaction, userObjDB) {
  async function createEmptyAvatarBuffer() {
    const promise = fs.promises.readFile("./src/imgs/emptyAvatar.png");
    return await Promise.resolve(promise);
  }

  let userGuildObj = {};
  await interaction.guild.members
    .fetch(interaction.user.id)
    .then((userGuild) => (userGuildObj = userGuild));
  Font.loadDefault();
  const curLevel = userObjDB.level;
  let prevLevel = 0;
  let prevNeededXp = 0;
  let nowPrewLvl = 0;
  const neededXp = 5 * Math.pow(curLevel, 2) + 50 * curLevel + 100;
  let xps = userObjDB.xp + userObjDB.currentXp;
  let curXps = userObjDB.xp + userObjDB.currentXp;

  if (userObjDB.level !== 0) {
    while (prevNeededXp < xps) {
      prevNeededXp += 5 * Math.pow(prevLevel, 2) + 50 * prevLevel + 100;

      if (prevNeededXp <= xps) {
        nowPrewLvl += 5 * Math.pow(prevLevel, 2) + 50 * prevLevel + 100;
      }
      ++prevLevel;
    }
    if (nowPrewLvl === 0 && curLevel !== 0) {
      curXps = xps - 100;
    } else {
      curXps = xps - nowPrewLvl;
    }
  }

  const rankCopy = new RankCardBuilder()
    .setAvatar(
      interaction.user.avatar
        ? `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png?size=256`
        : await createEmptyAvatarBuffer()
    )
    .setDisplayName(
      interaction.user.globalName
        ? interaction.user.globalName
        : interaction.user.username
    )
    .setUsername("@" + interaction.user.username)
    .setStatus(userGuildObj.presence?.status)
    .setCurrentXP(curXps)
    .setRequiredXP(neededXp)
    .setLevel(userObjDB.xp)
    .setRank(userObjDB.level);
  rankCopy.setTextStyles({
    level: "TOTAL XP :",
    xp: "XP TO NEXT LEVEL :",
    rank: "LEVEL :",
  });
  return rankCopy;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("xp")
    .setDescription("Виводить XP користувача")
    .addUserOption((option) =>
      option
        .setName("target-user")
        .setDescription("Користувач, XP якого ти хочеш подивитись")
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      if (!interaction.inGuild()) {
        interaction.reply("You can't run this command inside a server");
        return;
      }

      await interaction.deferReply();

      const mentionedUserId = interaction.options.get("target-user")?.value;
      const targetUserId = mentionedUserId || interaction.member.id;
      if (targetUserId === "1194725259446849647") {
        await interaction.editReply("Ти не можеш подивитись мій рівень😉");
        return;
      }
      const targetUserObj = await interaction.guild.members.fetch(targetUserId);
      let fetchedUser = await Level.findOne({
        userId: targetUserId,
        guildId: interaction.guild.id,
      });
      if (!fetchedUser) {
        fetchedUser = {
          userId: targetUserId,
          guildId: interaction.guild.id,
          xp: 0,
          level: 0,
          currentXp: 0,
        };
      } else {
        fetchedUser.level = await updateLevel(fetchedUser, targetUserId);
      }

      const rankCard = await createRankCard(targetUserObj, fetchedUser);
      rankCard.build().then(async (data) => {
        const attachments = [
          new AttachmentBuilder(data, {
            name: "rankcard.png",
          }),
        ];
        const xpEmbed = new EmbedBuilder()
          .setTitle(
            `Інформація про ${
              targetUserObj.user.globalName
                ? targetUserObj.user.globalName
                : targetUserObj.user.username
            }`
          )
          .setDescription(
            `Використано добового ліміту XP  \`${fetchedUser.currentXp} / 150\``
          )
          .setColor("White")
          .setImage("attachment://rankcard.png");

        await interaction.editReply({
          embeds: [xpEmbed],
          files: attachments,
        });
      });
    } catch (err) {
      console.log(err);
    }
  },
};
