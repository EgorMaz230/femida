let points = 0;
module.exports = function accrualPoints(message) {
  if (message.content.length > 3 && !message.author.bot) {
    points += 0.5;
  }
  console.log(points);
};