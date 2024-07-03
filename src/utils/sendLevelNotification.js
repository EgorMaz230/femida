const main = require("../index");
module.exports = async function sendLevelNotification({ id, level }) {
  try {
    const channel = await main.client.channels.fetch("1050608203945234442");
    channel.send({ content: `<@${id}> досяг ${level} рівня. Вітаємо тебе!` });
  } catch (err) {
    console.log("Error while sending level msg into public channel " + err);
  }
};
