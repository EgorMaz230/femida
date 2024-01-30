const badWords = ["bad_word1", "bad_word2"];
const mutedUsers = new Map();
const muteDuration = 12000; // 10 min

module.exports = async (message) => {
      const userId = message.author.id;

    // Check if the user is currently muted
    if (mutedUsers.has(userId)) {
        const unmuteTime = mutedUsers.get(userId);
        if (unmuteTime > Date.now()) {
            await message.reply(
                "Ви ще маєте діючий м'ют. Будь ласка, залишайтеся відсутнім(ою) від нецензурних слів."
            );
            await message.delete();
            return;
        }
    }

    // Check for bad words
    let containsBadWord = false;
    for (const badWord of badWords) {
        if (message.content.toLowerCase().includes(badWord)) {
            containsBadWord = true;
            break;
        }
    }

    if (containsBadWord) {
        await message.reply(
            "Це повідомлення було видалено через те, що воно містить нецензурне слово. Будь ласка, утримайтеся від використання такої мови."
        );
        await message.delete();

        const violations = (mutedUsers.get(userId) || 0) + 1;
        if (violations >= 2) {
            mutedUsers.set(userId, Date.now() + muteDuration); // Mute the user
            await message.channel.send(
                `Користувач @${message.author.tag} був замутений на ${(
          muteDuration / 60000
        ).toFixed(2)} хвилин за використання нецензурної мови.`
            );
        } else {
            mutedUsers.set(userId, violations);
        }
        console.log(mutedUsers);
    }
}