 const Level = require("../models/Level");
 const messages = require("../models/messages.js");

 module.exports = async(message, antiSpam, userCooldowns, userMuteCooldowns) => {
     // Отримання ідентифікатора користувача та тексту повідомлення
     const userId = message.author.id;
     const content = message.content;

     try {
         // Отримання часу останнього повідомлення користувача
         const lastMessageTime = userCooldowns.get(userId) || 0;
         const currentTime = Date.now();

         // Збереження нового повідомлення в базі даних
         const newMessage = new messages({
             userId: userId,
             message: content,
         });
         await newMessage.save();
         // console.log(`User wrote: ${content}`);

         // Перевірка наявності користувача в списку cooldowns
         if (!userCooldowns.has(userId)) {
             // Додавання користувача до списку cooldowns та встановлення таймауту
             userCooldowns.set(userId, currentTime);

             setTimeout(async() => {
                 // Отримання кількості аналогічних повідомлень користувача
                 const countOfSameMessages = await messages.countDocuments({
                     userId: userId,
                     message: content,
                 });

                 // Отримання повідомлень користувача на каналі
                 const userMessages = await message.channel.messages.fetch({ limit: 100 });
                 // Фільтрація спам-повідомлень користувача
                 const userSpamMessages = userMessages.filter((msg) => msg.author.id === userId && msg.content === content && msg.id !== message.id);

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
                     if (countOfSameMessages >= antiSpam.warnThreshold) {
                         // Надсилання попередження та віднімання деякої кількості досвіду (XP)
                         message.channel.send('За спам вам було знято 5 xp!');
                         const id = message.author.id;
                         Level.findOne({ userId: id })
                             .exec()
                             .then((op) => {
                                 if (op !== null) {
                                     let currentXp = op.currentXp - 5; // Віднімаємо 5 від currentXp
                                     Level.updateOne({ userId: id }, { currentXp: currentXp }).then();
                                     console.log('Points deducted');
                                 }
                             });
                     }
                 }

                 // Видалення користувача зі списку cooldowns
                 userCooldowns.delete(userId);
             }, 1000);
         }
     } catch (error) {
         console.log(error)
     }
 }