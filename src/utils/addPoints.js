const Level = require("../models/Level");

module.exports = (id, amount) => {
  Level.findOne({ userId: id })
    .exec()
    .then((op) => {
      if (op !== null) {
        let exp = op.currentXp + amount;
        Level.updateOne({ userId: id }, { xp: exp }).then();
      }
    });
}