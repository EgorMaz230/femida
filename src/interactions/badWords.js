const badWords = require("../constants/badWords");
const mutedRoleID = "1222130994430349352"; // ID ролі "Muted" NEW
// const mutedRoleID = "1211008108583850074"; // ID ролі "Muted" OLD
const muteDuration = 60;


// Мапа для зберігання кількості використань поганих слів кожним користувачем
const warnedUsers = new Map();

module.exports = async (message) => {
  const userId = message.author.id;
  const content = message.content.toLowerCase();
  const guild = message.guild;

  try {
    // Якщо користувач є в списку використань поганих слів, збільшуємо лічильник
    if (warnedUsers.has(userId)) {
      warnedUsers.set(userId, warnedUsers.get(userId) + 1);
    } else {
      // Якщо користувач не є в списку, додаємо його туди зі значенням 1
      warnedUsers.set(userId, 1);
    }

    let warned = false; // Флаг, який вказує, чи надано попередження

    // Перевірка наявності поганих слів у повідомленні
    for (const word of badWords) {
      if (content.includes(word)) {
        // Користувач використав погане слово
        const mutedRole = guild.roles.cache.get(mutedRoleID);
        if (!mutedRole) {
          console.error("Muted role not found.");
          return;
        }

        // Перевірка, чи користувач вже в замуті
        if (message.member.roles.cache.has(mutedRoleID)) {
          await message.channel.send(
            `${message.author}, Ти вже в муті за використання поганих слів!`
          );
          return;
        }

        // Якщо це перше використання поганого слова, надсилаємо попередження
        if (warnedUsers.get(userId) === 1) {
          await message.channel.send(
            `${message.author}, Не використовуй погані слова! (останнє попередження) :warning:`
          );
          warned = true;
        }

        // Якщо це друге або наступні використання, накладаємо мут
        if (warnedUsers.get(userId) >= 2) {
          // Видалення повідомлення
          await message.delete();
          await message.channel.send(
            `${message.author}, Догрався.`
          );
          // Надавання ролі "Muted" користувачеві
          await message.member.roles.add(mutedRole);
          // Зняття ролі "Muted" після muteDuration секунд
          setTimeout(async () => {
            await message.member.roles.remove(mutedRole);
            await message.channel.send(
              `${message.author}, Ти більше не в муті.`
            );
          }, muteDuration * 1000);
        }

        break; // Вийти з циклу, якщо знайдено погане слово
      }
    }

    // Якщо не було надано попередження і не було накладено мут
    if (!warned && warnedUsers.get(userId) === 1) {
      // Нічого не зробити, можливо, додати додаткову логіку тут
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
};