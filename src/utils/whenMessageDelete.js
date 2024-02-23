const Level = require("../models/Level");

function removePoints(id, amount) {
  Level.findOne({ userId: id })
    .exec()
    .then((op) => {
      if (op !== null) {
        let exp = op.xp - amount;
        Level.updateOne({ userId: id }, { xp: exp }).then();
      }
    });
}

module.exports = async (msg) => {
  const seconds = (Date.now() - msg.createdTimestamp) / 1000;
  const mins = seconds / 60;
  const hours = mins / 60;
  const days = hours / 24;
  const weeks = days / 7;
  if (weeks <= 1) {
    removePoints(msg.author.id, 1);
  }
};
