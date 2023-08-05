/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\commands\utility\ping.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat August 5th 2023 3:45:17 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
const { EmbedBuilder } = require('discord.js');

/**
 * Displays the bot's ping
 */
module.exports = {
  name: "ping",
  description: "Ping command",
  aliases: ["pingie", "p"],
  category: "Utility",

  /**
   * @param {*} message - The message object that was sent to trigger this command
   * @param {*} args - The arguments passed with this command
   * @param {*} guildPrefix - The prefix for this guild
   * @param {*} client - The Discord client
   */
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
