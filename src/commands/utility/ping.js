
/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\commands\utility\ping.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat November 25th 2023 11:39:37 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 MolexWorks / Tone Web Design
 */


const { EmbedBuilder, SlashCommandBuilder, MessageActionRow, MessageButton } = require('discord.js');
module.exports = {
  name: "ping",
  description: "Ping command",
  aliases: ["pingie", "p"],
  category: "Utility",
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),

  async execute(message, args, guildPrefix, client, interaction) {
    const startTime = Date.now();

    if (interaction) {
      const botLatency = Date.now() - interaction.createdTimestamp;
      const apiLatency = interaction.client.ws.ping;

      const embed = {
        color: parseInt("425678", 16),
        title: "Pong!",
        fields: [
          { name: "Bot Latency", value: botLatency + "ms" },
          { name: "API Latency", value: apiLatency + "ms" }
        ],
        timestamp: new Date(),
        footer: { text: `Roundtrip Time: ${Date.now() - startTime}ms` }
      };

      interaction.reply({ embeds: [embed] });
    } else {
      try {
        const embed = {
          color: parseInt("425678", 16),
          title: "Pinging...",
          timestamp: new Date()
        };

        const sentMessage = await message.channel.send({ embeds: [embed] });

        const botLatency = sentMessage.createdTimestamp - message.createdTimestamp;
        const apiLatency = sentMessage.client.ws.ping;

        embed.title = "Pong!";
        embed.fields = [
          { name: "Bot Latency", value: botLatency + "ms" },
          { name: "API Latency", value: apiLatency + "ms" }
        ];
        embed.footer = { text: `Roundtrip Time: ${Date.now() - startTime}ms` };

        sentMessage.edit({ embeds: [embed] });

      } catch (error) {
        console.error(error);
        message.reply("An error occurred while executing the ping command.");
      }
    }
  }
};
