const creatingRatingEmbed = require("./creatingRatingEmbed")
const cron = require("cron");

module.exports = async (client) => {
    const ratingEmbed = await creatingRatingEmbed(client);

  const sendRatingFn = async () => {
    client.channels
      .fetch("1192080421677191288")
      .then((channel) => channel.send({ embeds: [ratingEmbed] }));
  };
  const sendRatingJob = new cron.CronJob("20 * * * * *", sendRatingFn);
  sendRatingJob.start();
}