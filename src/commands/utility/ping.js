const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "ping",
  description: "Ping command",
  aliases: ["pingie", "p"],
  category: "Utility",
  async execute(message, args, guildPrefix, client) {
    try {

      const startTime = Date.now();

      const embed = new EmbedBuilder()
        .setColor("#425678")
        .setTitle("Pinging...")
        .setTimestamp();

      const sentMessage = await message.channel.send({ embeds: [embed] });
      const botLatency = sentMessage.createdTimestamp - message.createdTimestamp;
      const apiLatency = client.ws.ping;

      const endTime = Date.now();

      embed.setTitle("Pong!")
        .addFields(
          { name: "Bot Latency", value: botLatency + "ms" },
          { name: "API Latency", value: apiLatency + "ms" }
        )
        .setFooter({ text: `Roundtrip Time: ${endTime - startTime}ms` });

      sentMessage.edit({ embeds: [embed] });

    } catch (error) {

      console.error(error);
      message.reply("An error occurred while executing the ping command.");
      
    }
  }
};
