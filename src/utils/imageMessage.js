const Level = require("../models/Level");

module.exports = async (message) => {
  if (message.attachments.size > 0) {
    client.on("messageDelete", async (msg) => {
      const id = msg.author.id;
      Level.findOne({ userId: id })
        .exec()
        .then((op) => {
          if (op !== null) {
            let exp = op.xp - 1;
            Level.updateOne({ userId: id }, { xp: exp }).then();
          }
        });
    });

    message.reply("Вам не нараховано XP через відправлене фото.");

    client.on("messageDelete", async (msg) => {
      const id = msg.author.id;
      const seconds = (Date.now() - msg.createdTimestamp) / 1000;
      const mins = seconds / 60;
      const hours = mins / 60;
      const days = hours / 24;
      const weeks = days / 7;
      if (weeks <= 1) {
        Level.findOne({ userId: id })
          .exec()
          .then((op) => {
            if (op !== null) {
              let exp = op.xp - 1;
              Level.updateOne({ userId: id }, { xp: exp }).then();
            }
          });
      }
    });

    const userId = message.author.id;
    const userLevel = await Level.findOne({ userId });
    if (userLevel !== null) {
      const exp = userLevel.xp - 1;
      await Level.updateOne({ userId: userId }, { xp: exp });
      console.log(`Зменшено XP користувача ${userId} через відправлене фото.`);
    }

    return;
  }
};
