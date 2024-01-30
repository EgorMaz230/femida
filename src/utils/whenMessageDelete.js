const Level = require("../models/Level");

module.exports = async (msg) => {
    const id = msg.author.id;
    Level.findOne({ userId: id })
        .exec()
        .then((op) => {
            if (op !== null) {
                let exp = op.xp - 1;
                Level.updateOne({ userId: id }, { xp: exp }).then();
            }
        });
}