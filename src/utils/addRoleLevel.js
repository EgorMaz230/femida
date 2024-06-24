const { config } = require("dotenv");
const Level = require("../models/Level");

config();

const roles = [
    { level: 5, roleId: '1253646059486580837' },
    { level: 10, roleId: '1253646156173672508' },
    { level: 15, roleId: '1253646191644901439' },
    { level: 20, roleId: '1253646251732238377' },
    { level: 25, roleId: '1253646314621632572' },
    { level: 30, roleId: '1253646399820795964' },
];

const guildId = process.env.GUILD_ID;

// Додавання ролі користувачеві
async function addRole(userId, roleId) {
    await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bot ${process.env.TOKEN}`,
        },
    });
}

// Зняття ролі з користувача
async function removeRole(userId, roleId) {
    await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bot ${process.env.TOKEN}`,
        },
    });
}

module.exports = async function addRoleLevel({ level, xp }, userId) {
    // Отримання поточного рівня користувача з бази даних
    const userLevelData = await Level.findOne({ userId });
    const currentLevel = userLevelData ? userLevelData.level : 0;

    // Обробка додавання та зняття ролей
    for (let i = 0; i < roles.length; i++) {
        const { level: roleLevel, roleId } = roles[i];

        if (currentLevel < roleLevel && level >= roleLevel) {
            // Додаємо нову роль
            await addRole(userId, roleId);

            // Видаляємо попередні ролі
            for (let j = 0; j < i; j++) {
                const { roleId: previousRoleId } = roles[j];
                await removeRole(userId, previousRoleId);
            }
        }
    }
}