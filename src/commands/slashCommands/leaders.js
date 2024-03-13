const { SlashCommandBuilder } = require("discord.js");
const { AttachmentBuilder } = require("discord.js");
const creatingRatingEmbed = require("../../utils/creatingRatingEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaders")
    .setDescription("Надсилає рейтинг учасників серверу"),
  async execute(interaction, client) {
    await interaction.deferReply();
    const sendRatingFn = async () => {
      const ratingEmbed = await creatingRatingEmbed(client);
      let attachment = new AttachmentBuilder(
        "src/imgs/goiteens-logo.jpg",
        "goiteens-logo.jpg"
      );
      if (ratingEmbed.data.title === "Помилка") {
        attachment = new AttachmentBuilder(
          "src/imgs/catError.gif",
          "catError.gif"
        );
      }
      ratingEmbed.data.title = "Рейтинг учасників серверу";
      await interaction
        .editReply({
          files: [attachment],
          embeds: [ratingEmbed],
        })
        .catch((e) => console.log(e));
    };
    sendRatingFn();
  },
};
