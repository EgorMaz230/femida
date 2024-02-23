const clearDatabase = require("../utils/clearDatabase");

module.exports = () => {
    clearDatabaseInterval = setInterval(clearDatabase, 60000);
  }