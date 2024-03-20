const {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder,
} = require("discord.js");
const Level = require("../../models/Level");
const updateLevel = require("../../utils/updateLevel.js");
const { RankCardBuilder, Font } = require("canvacord");

function calculateXPForLevel(lvl) {
  let xpForLevel = 0;
  for (let i = 0; i < lvl; i++) {
    xpForLevel += 5 * Math.pow(i, 2) + 50 * i + 100;
  }
  return xpForLevel;
}

async function createRankCard(interaction, userObjDB) {
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
        : "https://static-00.iconduck.com/assets.00/discord-icon-256x256-9xetatcg.png"
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
    level: "TOTAL XP :", // Custom text for the level
    xp: "XP TO NEXT LEVEL :", // Custom text for the experience points
    rank: "LEVEL :", // Custom text for the rank
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
        interaction.editReply("Ти не можеш подивитись мій рівень😉");
        return;
      }
      const targetUserObj = await interaction.guild.members.fetch(targetUserId);
      const fetchedUser = await Level.findOne({
        userId: targetUserId,
        guildId: interaction.guild.id,
      });
      await updateLevel(fetchedUser, targetUserId);
      if (!fetchedUser) {
        interaction.editReply(
          mentionedUserId
            ? `${targetUserObj.user.tag} doesn't have any xp yet. Try again when they chat a little more`
            : `You don't have any xp yet. Chat a little more and try again`
        );
        return;
      }

      const rankCard = await createRankCard(targetUserObj, fetchedUser);
      console.log(rankCard);
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

        // if (!interaction.user.avatar) {
        //   attachments.push(
        //     new AttachmentBuilder("../../imgs/emptyAvatar.png", {
        //       name: "emptyAvatar.png",
        //     })
        //   );
        // }

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
