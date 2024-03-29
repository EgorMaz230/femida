const removePoints = require("../utils/removePoints");

module.exports = async (msg, AuditLogEvent, client) => {
  const logs = await msg.guild.fetchAuditLogs({
    type: AuditLogEvent.MessageDelete,
    limit: 1,
  });
  const firstEntry = logs.entries.first();
  const { executorId, target, targetId } = firstEntry;
  const user = await client.users.fetch(executorId);
  if (target) {
    console.log(`A message by ${target.tag} was deleted by ${user.tag}.`);
  } else {
    console.log(`A message with id ${targetId} was deleted by ${user.tag}.`);
  }
  const seconds = (Date.now() - msg.createdTimestamp) / 1000;
  const mins = seconds / 60;
  const hours = mins / 60;
  const days = hours / 24;
  const weeks = days / 7;
  if (weeks <= 1 && !user.bot) {
    removePoints(msg.author.id, 2);
  }
};
