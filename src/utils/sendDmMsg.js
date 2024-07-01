const { EmbedBuilder } = require("discord.js");

module.exports = async function sendDmMsg({ id, level }) {
  async function getChannelId(userId) {
    try {
      const resp = await fetch("https://discord.com/api/users/@me/channels", {
        method: "POST",
        body: JSON.stringify({
          recipient_id: userId,
        }),
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Authorization: `Bot ${process.env.TOKEN}`,
        },
      });
      const DMchannel = await resp.json();
      return DMchannel;
    } catch (err) {
      console.log("Discord API: creating new DM channel failed: " + err);
      return 0;
    }
  }
  async function sendMsgIntoChannel(channelId, msgContent) {
    try {
      await fetch(`https://discord.com/api/channels/${channelId}/messages`, {
        method: "POST",
        body: JSON.stringify(msgContent),
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Authorization: `Bot ${process.env.TOKEN}`,
        },
      });
    } catch (err) {
      console.log("Discord API: sending DM message failed: " + err);
    }
  }

  const channel = await getChannelId(id);
  const levelEmbed = {
    embeds: [
      new EmbedBuilder()
        .setColor("#466f8f")
        .setTitle("Вітаю, ти досяг/ла нового ювілейного рівня - " + level)
        .setDescription(
          "А це значить що ти маєш право на подарунок! Для того щоб його отримати напиши до адміністрації серверу)"
        )
        .setAuthor({ name: channel.recipients[0].username })
        .setTimestamp(),
    ],
  };
  await sendMsgIntoChannel(channel.id, levelEmbed);
};
