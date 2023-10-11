/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\commands\utility\help.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Wed October 11th 2023 4:10:00 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require("path");
const axios = require('axios');

/**
 * The `help` command displays a list of available commands.
 */
module.exports = {
  name: "help",
  description: "Information for specific command, ex: 'prefix help setup'",
  aliases: ["commands"],
  category: "Utility",
  usage: `<command>`,

  /**
   * The `help` command displays a list of available commands.
   * @param {*} message - The message
   * @param {*} args - The arguments
   * @param {*} guildPrefix - The guild prefix
   * @param {*} client - The client
   * @returns - {void}
   */
  async execute(message, args, guildPrefix, client) {
    const { commands } = message.client;
    const guildId = message.guild.id;

    let prefix = '';

    try {
      const response = await axios.get(`https://api.tonewebdesign.com/pa/regiments/g/${guildId}/discordGuild`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      prefix = response.data.prefix;

    } catch (error) {
      console.error(error);

      const guildConfigPath = path.join(__dirname, '../../../guilds', `${guildId}.json`);
      const guildConfig = JSON.parse(fs.readFileSync(guildConfigPath, 'utf8'));

      prefix = guildConfig.prefix || process.env.DEFAULT_PREFIX;
    }

    this.description = `Information for specific command, ex: '\`${prefix}help setup\`'`;

    if (!args.length) {
      const groupedCommands = {};
      commands.forEach((command) => {
        const category = command.category || "Other";
        if (!groupedCommands[category]) {
          groupedCommands[category] = [];
        }
        groupedCommands[category].push(command);
      });
      const embed = new EmbedBuilder()
        .setColor("#425678")
        .setTitle("Available Commands")
        .setDescription("Here's a list of all available commands:");

      for (const [category, commandList] of Object.entries(groupedCommands)) {
        const commandDescriptions = commandList.map(command => `\`${prefix}${command.name}${command.usage ? " " + command.usage : ""}\`: ${command.description}`).join("\n");
        embed.addFields(
          { name: category, value: commandDescriptions },
        );
      }
      message.channel.send({ embeds: [embed] });
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

      if (!command) {
        return message.reply("That's not a valid command.");
      }
      const embed = new EmbedBuilder()
        .setColor("#425678")
        .setTitle(`Command: ${command.name}`)
        .setDescription(`**Description:** ${command.description}`)
        .addFields(
          { name: "Usage", value: `\`${prefix}${command.name}${command.usage ? " " + command.usage : ""}\`` },
        );
      if (command.aliases) {
        const prefixedAliases = command.aliases.map(alias => `\`${prefix}${alias}\``);
        embed.addFields(
          { name: "Aliases", value: prefixedAliases.join(", ") },
        );
      }
      if (command.isAdmin) {
        embed.addFields(
          { name: "Admin Only", value: "This command can only be used by administrators." },
        );
      }
      message.channel.send({ embeds: [embed] });
    }
  }
};
