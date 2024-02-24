const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const Level = require("../../models/Level");
const { RankCardBuilder, Font } = require("canvacord");

async function createRankCard(interaction, userObjDB) {
  let userGuildObj = {};
  await interaction.guild.members
    .fetch(interaction.user.id)
    .then((userGuild) => (userGuildObj = userGuild));
  Font.loadDefault();
  const rankCopy = new RankCardBuilder()
    .setAvatar(
      `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png?size=256`
    )
    .setDisplayName(interaction.user.globalName)
    .setUsername("@" + interaction.user.username)
    .setStatus(userGuildObj.presence?.status)
    .setCurrentXP(userObjDB.xp)
    .setRequiredXP(150)
    .setLevel(userObjDB.level);
  return rankCopy;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("xp")
    .setDescription("Shows your/someone's xp.")
    .addUserOption((option) =>
      option
        .setName("target-user")
        .setDescription("The user whose xp you want to see")
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      interaction.reply("You can't run this command inside a server");
      return;
    }

    await interaction.deferReply();

    const mentionedUserId = interaction.options.get("target-user")?.value;
    const targetUserId = mentionedUserId || interaction.member.id;
    const targetUserObj = await interaction.guild.members.fetch(targetUserId);

    const fetchedUser = await Level.findOne({
      userId: targetUserId,
      guildId: interaction.guild.id,
    });
    if (!fetchedUser) {
      interaction.editReply(
        mentionedUserId
          ? `${targetUserObj.user.tag} doesn't have any xp yet. Try again when they chat a little more`
          : `You don't have any xp yet. Chat a little more and try again`
      );
      return;
    }
    if (targetUserId === "1194725259446849647") {
      interaction.editReply("Ти не можеш подивитись мій рівень😉");
      return;
    }
    const rankCard = await createRankCard(targetUserObj, fetchedUser);
    rankCard.build().then(async (data) => {
      const attachment = new AttachmentBuilder(data, "rankCard.png");
      await interaction.editReply({ files: [attachment] });
    });

    if (!interaction.inGuild()) {
      interaction.reply("You can't run this command inside a server");
      return;
    }
  },
};
