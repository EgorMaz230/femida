const { AttachmentBuilder } = require("discord.js");
const creatingRatingEmbed = require("../utils/creatingRatingEmbed");
const cron = require("cron");

module.exports = async (client) => {
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
    client.channels.fetch("1192080421677191288").then((channel) =>
      channel
        .send({
          files: [attachment],
          embeds: [ratingEmbed],
        })
        .catch((err) => console.log(err))
    );
  };
  const sendRatingJob = new cron.CronJob("20 10 * * * *", sendRatingFn);
  sendRatingJob.start();
};
