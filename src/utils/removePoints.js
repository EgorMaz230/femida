const Level = require("../models/Level");

module.exports = (id, amount) => {
  Level.findOne({ userId: id })
    .exec()
    .then((op) => {
      if (op !== null) {
        if (op.currentXp >= amount) {
          const exp = op.currentXp - amount;
          Level.updateOne({ userId: id }, { currentXp: exp }).then();
          return;
        }

        if (op.xp >= amount) {
          const exp = op.xp - amount;
          Level.updateOne({ userId: id }, { xp: exp }).then();
          return;
        }
      }
    });
};
