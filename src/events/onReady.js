module.exports = {
    name: "ready",
    once: true,
    execute(client) {
      console.log(`Bot is ready as ${client.user.tag}`);
    }
  };
  