const Level = require("../models/Level.js");
const messages = require("../models/messages.js");
const antiSpam = require("../constants/antiSpam.js");
const userMuteCooldowns = require("../constants/newMap.js");



module.exports = async(message) => {
    // Отримання ідентифікатора користувача та тексту повідомлення
    const userId = message.author.id;
    const content = message.content;

    try {
        // Отримання часу останнього повідомлення користувача

        const currentTime = Date.now();

        // Збереження нового повідомлення в базі даних
        const newMessage = new messages({
            userId: userId,
            message: content,
        });
        await newMessage.save();

        // Перевірка наявності користувача в списку cooldowns
        if (!userMuteCooldowns.has(userId)) {
            // Додавання користувача до списку cooldowns та встановлення таймауту
            userMuteCooldowns.set(userId, 0);

            setTimeout(async() => {
                // Отримання кількості аналогічних повідомлень користувача
                const countOfSameMessages = await messages.countDocuments({
                    userId: userId,
                    message: content,
                });

                // Отримання повідомлень користувача на каналі
                const userMessages = await message.channel.messages.fetch({
                    limit: 100,
                });
                // Фільтрація спам-повідомлень користувача
                const userSpamMessages = userMessages.filter(
                    (msg) =>
                    msg.author.id === userId &&
                    msg.content === content &&
                    msg.id !== message.id
                );

                // Видалення спам-повідомлень
                userSpamMessages.forEach(async(msg) => {
                    try {
                        await msg.delete();
                    } catch (error) {
                        console.error("Error deleting message:", error);
                    }
                });

                // Визначення дій в залежності від кількості аналогічних повідомлень
                if (countOfSameMessages >= antiSpam.warnThreshold) {

                    if (countOfSameMessages >= antiSpam.muteTreshold) {
                        // console.log(countOfSameMessages)
                        // console.log(antiSpam.muteTreshold)

                        // Встановлення ролі "Muted" та часу мута
                        const lastMuteTime = userMuteCooldowns.get(userId);
                        console.log('userMuteCooldowns', userMuteCooldowns.get(userId));
                        const muteCooldown = 60 * 1000; // 1 хвилина

                        if ((currentTime) - lastMuteTime > muteCooldown) {
                            console.log(Number(currentTime) - lastMuteTime, muteCooldown);
                            console.log(' currentTime', currentTime);
                            console.log('lastMuteTime', lastMuteTime);

                            const muteRole = message.guild.roles.cache.find(

                                (role) => role.id === "1222130994430349352"




                            );

                            if (muteRole) {
                                const member = message.guild.members.cache.get(userId);
                                if (member) {
                                    member.roles.add(muteRole);
                                    message.channel.send(
                                        `<@${userId}> ${antiSpam.muteMessage}`
                                    );

                                    userMuteCooldowns.set(userId, Date.now());

                                    // Зняття ролі "Muted" після вказаного часу
                                    setTimeout(() => {
                                        member.roles.remove(muteRole);
                                    }, antiSpam.unMuteTime * 1000);
                                }
                            }
                        }
                    } else if (countOfSameMessages >= antiSpam.warnThreshold) {
                        // код для надсилання попередження та віднімання деякої кількості досвіду (XP)
                        message.channel.send(antiSpam.warnMessage);
                        const id = message.author.id;
                        Level.findOne({ userId: id })
                            .exec()
                            .then((op) => {
                                if (op !== null) {
                                    let exp = op.currentXp - 5;
                                    Level.updateOne({ userId: id }, { currentXp: exp }).then();
                                    console.log("Points deducted");
                                }
                            });
                    }

                }

                // Видалення користувача зі списку cooldowns
                userMuteCooldowns.delete(userId);
            }, 1000);
        }
    } catch (error) {
        console.log(error);
    }
};