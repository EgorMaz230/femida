const { AttachmentBuilder } = require("discord.js");
const creatingRatingEmbed = require("../utils/creatingRatingEmbed");
const cron = require("cron");

module.exports = async (client) => {
  const sendRatingFn = async () => {
    const ratingEmbed = await creatingRatingEmbed(client);

    client.channels.fetch("1192080421677191288").then((channel) =>
      channel.send({
        files: [
          new AttachmentBuilder(
            "src/imgs/goiteens-logo.jpg",
            "goiteens-logo.jpg"
          ),
        ],
        embeds: [ratingEmbed],
      })
    );
  };
  const sendRatingJob = new cron.CronJob("10 30 * * * *", sendRatingFn);
  sendRatingJob.start();
};
