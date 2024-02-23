const { config } = require("dotenv");
const { default: mongoose } = require("mongoose");

config();

module.exports = async (client) => {
    console.log(`${client.user.tag} is online`);
    try {
      await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");
    } catch (error) {
        console.log(`There was an error whil connecting to database ${error}`);
    }}