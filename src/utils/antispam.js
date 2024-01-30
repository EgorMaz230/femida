 const messages = require("../models/messages.js");
 
 

module.exports = async () => {
   
// Функція для очищення бази даних
async function clearDatabase() {
    try {
        await messages.deleteMany({})
        console.log("База даних очищена.");
    } catch (error) {
        console.error("Помилка при очищенні бази даних:", error);
    }
}

// Функція для запуску таймера очищення бази даних
function startClearDatabaseInterval() {
    clearDatabaseInterval = setInterval(clearDatabase, 60000);
}
startClearDatabaseInterval();


// antiSpam.messageCount = new Map();
// const userMuteCooldowns = new Map();
// const userCooldowns = new Map();
}