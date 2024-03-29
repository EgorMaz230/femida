const Level = require("../models/Level");

module.exports = (id, amount) => {
  Level.findOne({ userId: id })
    .exec()
    .then((op) => {
      if (op !== null) {
        if (op.currentXp >= amount / 2) {
          const exp = op.currentXp - amount < 0 ? 0 : op.currentXp - amount;
          Level.updateOne({ userId: id }, { currentXp: exp }).then();
          return;
        }

        if (op.xp >= amount / 2) {
          const exp = op.xp - amount < 0 ? 0 : op.xp - amount;
          Level.updateOne({ userId: id }, { xp: exp }).then();
          return;
        }
      }
    });
};
