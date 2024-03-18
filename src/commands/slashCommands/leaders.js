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
      let attachments = [];
      if (ratingEmbed.data.title === "Помилка") {
        attachments = [
          new AttachmentBuilder("src/imgs/catError.gif", "catError.gif"),
        ];
      } else {
        ratingEmbed.data.title = "Рейтинг учасників серверу";
      }
      await interaction
        .editReply({
          files: attachments,
          embeds: [ratingEmbed],
        })
        .catch((err) => console.log(err));
    };
    sendRatingFn();
  },
};
