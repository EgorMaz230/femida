const Level = require("../models/Level");

module.exports = async (interaction) => {
    const currentUsers = await Level.find({ userId: interaction.user.id });

    if (currentUsers.length === 0) {
        const newUser = new Level({
            userId: interaction.user.id,
            guildId: interaction.guild.id,
            xp: 0,
            level: 1,
        });

        await newUser.save();
    }

}