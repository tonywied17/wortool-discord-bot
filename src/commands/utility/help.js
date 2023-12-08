const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require("path");
const axios = require('axios');

const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription("Information for specific command, ex: 'prefix help setup'")
  .addStringOption(option =>
    option.setName('command')
      .setDescription('Specific command to get information for')
      .setRequired(false)
  );

module.exports = {
  name: "help",
  description: "Information for specific command, ex: 'prefix help setup'",
  aliases: ["commands"],
  category: "Utility",
  usage: `<command>`,
  data,

  async execute(message, args, guildPrefix, client, interaction) {
    const { commands } = interaction ? interaction.client : message.client;
    const guildId = interaction ? interaction.guildId : message.guildId;

    let prefix = '';

    try {
      const response = await axios.get(`https://api.wortool.com/v2/regiments/g/${guildId}/discordGuild`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      prefix = response.data.prefix;

    } catch (error) {
      console.error(error);
      prefix = process.env.DEFAULT_PREFIX;
    }

    this.description = `Information for specific command, ex: '\`${prefix}help setup\`'`;

    if (interaction) {
      // Handle slash command interaction
      const commandName = interaction.options.getString('command');
      if (commandName) {
        const command = commands.get(commandName.toLowerCase()) || commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName.toLowerCase()));

        if (!command) {
          return interaction.reply("That's not a valid command.");
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
        return interaction.reply({ embeds: [embed] });
      } else {

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
        const commandDescriptions = commandList.map(command => `\`/${command.name}\`: ${command.description}`).join("\n");
        embed.addFields(
          { name: category, value: commandDescriptions },
        );
      }
      return interaction.reply({ embeds: [embed] });

      }
    } else {
      // Handle regular message command
      if (!args.length) {
        // Show all commands
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
        return message.channel.send({ embeds: [embed] });
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
        return message.channel.send({ embeds: [embed] });
      }
    }
  }
};
