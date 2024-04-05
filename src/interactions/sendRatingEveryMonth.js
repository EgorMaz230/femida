const { AttachmentBuilder } = require("discord.js");
const creatingRatingEmbed = require("../utils/creatingRatingEmbed");
const cron = require("cron");

module.exports = async (client) => {
  const sendRatingFn = async () => {
    const ratingEmbed = await creatingRatingEmbed(client);
    let attachments = [];
    if (ratingEmbed.data.title === "Помилка") {
      attachments = [
        new AttachmentBuilder("src/imgs/catError.gif", "catError.gif"),
      ];
    } else {
      ratingEmbed.data.description = "Привітаємо переможців🥳";
    }
    client.channels.fetch("1050608203945234442").then((channel) =>
      channel
        .send({
          files: attachments,
          embeds: [ratingEmbed],
        })
        .catch((err) => console.log(err))
    );
  };
  const sendRatingJob = new cron.CronJob(
    "00 30 18 1 * *",
    sendRatingFn,
    null,
    true,
    "Europe/Kiev"
  );
};
