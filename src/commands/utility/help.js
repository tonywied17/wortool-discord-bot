const { EmbedBuilder } = require('discord.js');
const config = require('../../../config.json');
const fs = require('fs');
const path = require("path");

module.exports = {
  name: "help",
  description: `Information for specific command, ex: \`${config.PREFIX}help setup\``,
  aliases: ["commands"],
  category: "Utility",
  usage: `[command name]`,
  execute(message, args) {
    const { commands } = message.client;
    const guildId = message.guild.id;
    const guildConfigPath = path.join(__dirname, '../../../guilds', `${guildId}.json`);
    const guildConfig = JSON.parse(fs.readFileSync(guildConfigPath, 'utf8'));
    const prefix = guildConfig && guildConfig.prefix ? guildConfig.prefix : config.defaultPrefix;

    if (!args.length) {
      // If no command name is provided, display all available commands categorized by folder
      const groupedCommands = {};
      commands.forEach((command) => {
        const category = command.category || "Other";
        if (!groupedCommands[category]) {
          groupedCommands[category] = [];
        }
        groupedCommands[category].push(command);
      });

      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("Available Commands")
        .setDescription("Here's a list of all available commands categorized by folder:");

      for (const [category, commandList] of Object.entries(groupedCommands)) {
        const commandDescriptions = commandList.map(command => `**${prefix}${command.name}**: ${command.description}`).join("\n");
        embed.addFields(
          { name: category, value: commandDescriptions },
        );
      }

      message.channel.send({ embeds: [embed] });
    } else {
      // If a command name is provided, display information about that command
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

      if (!command) {
        return message.reply("That's not a valid command.");
      }

      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`Command: ${command.name}`)
        .setDescription(`**Description:** ${command.description}`)
        .addFields(
          { name: "Usage", value: `${prefix}${command.name} ${command.usage ? command.usage : "" }` },
        );

      if (command.aliases) {
        embed.addFields(
          { name: "Aliases", value: command.aliases.join(", ") },
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
