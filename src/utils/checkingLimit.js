const Level = require("../models/Level");

module.exports = async (userId) => {
  const user = await Level.find({ userId });
  const limit = user.currentXp < 100 ? true : false;
  return limit;
};
