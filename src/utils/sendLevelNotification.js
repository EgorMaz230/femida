module.exports = async function sendLevelNotification({ id, level }) {
  try {
    await fetch(
      `https://discord.com/api/channels/1050608203945234442/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          content: `<@${id}> досяг ${level} рівня. Вітаємо тебе!`,
        }),
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Authorization: `Bot ${process.env.TOKEN}`,
        },
      }
    );
  } catch (err) {
    console.log("Discord API error" + " " + err);
  }
};
