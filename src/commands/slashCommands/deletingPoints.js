const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const Level = require("../../models/Level.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removepoint")
    .setDescription("Remove points from member.")
    .addStringOption((option) =>
      option
        .setName("target-user")
        .setDescription("Removing from member the point/s.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("how-much")
        .setDescription("Choose how much you will remove points from member.")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      interaction.reply("You can't run this command inside a server");
      return;
    }

    await interaction.deferReply();

    let points = Number(interaction.options.getString("how-much"));

    const userObjDb = await Level.findOne({
      userId: interaction.options.getString("target-user"),
    });
    console.log(userObjDb);

    if (
      interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      const updatedXp = userObjDb.xp - points;
      await Level.findOneAndUpdate(
        { userId: interaction.options.getString("target-user") },
        { xp: updatedXp }
      );
      interaction.editReply({
        content: "You sucefully removed points from member.",
      });
    } else {
      console.log("You dont have enough permissions.");
    }

    await console.log(
      await Level.findOne({
        userId: interaction.options.getString("target-user"),
      })
    );
    setTimeout(() => {
      console.log(userObjDb.xp);
    }, 1000);
  },
};
