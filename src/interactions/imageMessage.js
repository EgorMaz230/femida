const Level = require("../models/Level");

module.exports = async(message) => {
    if (message.author.bot || !message.content) return;

    // Перевірка, чи є прикріплені файли (фото)
    if (message.attachments.size > 0) {


        const userId = message.author.id;
        const userLevel = await Level.findOne({ userId });
        if (userLevel !== null) {
            const exp = userLevel.xp - 1;
            await Level.updateOne({ userId: userId }, { xp: exp });

        }

        return;
    }
};