<<<<<<< HEAD:src/interactions/sendRatingEveryMonth.js
const creatingRatingEmbed = require("../utils/creatingRatingEmbed")
=======
const creatingRatingEmbed = require("./creatingRatingEmbed");
>>>>>>> 6931b958790e74cfe3b5def5e30ba4432976c92c:src/utils/sendRatingEveryMonth.js
const cron = require("cron");

module.exports = async (client) => {
  const sendRatingFn = async () => {
    const ratingEmbed = await creatingRatingEmbed(client);

    client.channels
      .fetch("1192080421677191288")
      .then((channel) =>
        channel.send({ embeds: [ratingEmbed], fetchReply: true })
      );
  };
  const sendRatingJob = new cron.CronJob("20 * * * * *", sendRatingFn);
  sendRatingJob.start();
};
