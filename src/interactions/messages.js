const Level = require("../models/Level");
const db = require("mongoose");
const sameLetters = require("../utils/sameLetters");
const updateLevel = require("../utils/updateLevel");

module.exports = async function accrualPoints(message) {
    console.log("limit");
    const userId = message.author.id;
    const studentRoleId = "1260674858602467428"; // Роль 'student'
    const people = await Level.findOne({ userId: userId });

    if (people.currentXp !== 150) {
        if (
            message.content.length > 3 &&
            !message.author.bot &&
            sameLetters(message.content)
        ) {
            const userId = message.author.id;
            const people = await Level.findOne({ userId: userId });

            // Перевірка наявності ролі 'student'
            const isStudent = message.member.roles.cache.has(studentRoleId);
            let pointsToAdd = isStudent ? 4 : 2;

            let updateXp = people.currentXp + pointsToAdd;
            console.log("first", updateXp);

            if (updateXp > 150) {
                updateXp = 150;
                console.log("second", updateXp);
            }

            await Level.findOneAndUpdate({ userId: userId }, { currentXp: updateXp });
            await updateLevel(people, userId);
        }
    }
};