const messages = require("../models/messages");
// Функція для очищення бази даних
module.exports = async () => {
  try {
    await messages.deleteMany({});
    console.log("База даних очищена.");
  } catch (error) {
    console.error("Помилка при очищенні бази даних:", error);
  }
}