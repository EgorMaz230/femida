const { EmbedBuilder } = require("discord.js");

module.exports = async function sendDmMsg({ id, level }) {
  async function getChannelId(userId) {
    try {
      const resp = await fetch(
        "https://discord.com/api/users/@me/channels",
        {
          method: "POST",
          body: JSON.stringify({
            recipient_id: userId,
          }),
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
            Authorization: `Bot ${process.env.TOKEN}`,
          },
        }
      );
      const DMchannel = await resp.json();
      return DMchannel.id;
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
  const levelEmbed = {
    embeds: [
      new EmbedBuilder()
        .setColor("White")
        .setTitle("Вітаю, ти досяг/ла нового ювілейного рівня - " + level)
        .setDescription("Напиши адміністрації з цього приводу ;)")
        .setTimestamp(),
    ],
  };
  const channelId = await getChannelId(id);
  await sendMsgIntoChannel(channelId, levelEmbed);
};
