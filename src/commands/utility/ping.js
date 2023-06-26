module.exports = {
  name: "ping",
  description: "Ping command",
  aliases: ["pingie", "p"],
  category: "Utility",
  execute(message, args, guildPrefix) {
    message.channel.send("Pong! Guild prefix: " + guildPrefix);
  }
};
