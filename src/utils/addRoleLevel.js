const { config } = require("dotenv");
const Level = require("../models/Level");

config();

const roles = [
    { level: 0, roleId: "1255566866064212019" },
    { level: 5, roleId: '1253646059486580837' },
    { level: 10, roleId: '1253646156173672508' },
    { level: 15, roleId: '1253646191644901439' },
    { level: 20, roleId: '1253646251732238377' },
    { level: 25, roleId: '1253646314621632572' },
    { level: 30, roleId: '1253646399820795964' },
    { level: 35, roleId: '1254385618830491740' },
    { level: 40, roleId: '1254385756055670826' },
    { level: 45, roleId: '1254385850079379456' },
    { level: 50, roleId: '11254385910401863782' },
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

    // Знайти найбільший рівень, який кратний 5, і користувач досягнув або перевищив його
    let newRole;
    for (let i = roles.length - 1; i >= 0; i--) {
        if (level >= roles[i].level) {
            newRole = roles[i];
            break;
        }
    }

    if (newRole) {
        // Додаємо нову роль
        await addRole(userId, newRole.roleId);

        // Видаляємо всі попередні ролі, рівень яких менший за новий рівень користувача
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].level < newRole.level) {
                await removeRole(userId, roles[i].roleId);
            }
        }
    }
}