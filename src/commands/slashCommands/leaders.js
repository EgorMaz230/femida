const { SlashCommandBuilder } = require("discord.js");
const { AttachmentBuilder } = require("discord.js");
const creatingRatingEmbed = require("../../utils/creatingRatingEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaders")
    .setDescription("Надсилає рейтинг учасників серверу"),
  async execute(interaction, client) {
      await interaction.deferReply();
      console.log(interaction);
    const sendRatingFn = async () => {
      const ratingEmbed = await creatingRatingEmbed(client);

      await interaction.editReply({
        files: [
          new AttachmentBuilder(
            "src/imgs/goiteens-logo.jpg",
            "goiteens-logo.jpg"
          ),
        ],
        embeds: [ratingEmbed],
      });
    };
    sendRatingFn();
  },
};
