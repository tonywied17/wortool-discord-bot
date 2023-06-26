const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: "messageCreate",
  execute(client, prefix, message) {
    // Ignore messages from bots or without the prefix
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Get the command from the commandHandler
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    // Check if the command exists and user is an admin in the guild
    if (command && (command.isAdmin && !message.member?.permissions.has("ADMINISTRATOR"))) {
      return message.reply("You must be an admin to execute this command.");
    }

    // Get the guild-specific prefix
    const guildId = message.guild.id;
    const guildConfigPath = path.join(__dirname, '../../guilds', `${guildId}.json`);
    let guildPrefix = prefix; // Default prefix

    // Check if the guild-specific configuration file exists
    if (fs.existsSync(guildConfigPath)) {
      try {
        const guildConfig = JSON.parse(fs.readFileSync(guildConfigPath, 'utf8'));
        guildPrefix = guildConfig.prefix || prefix; // Use the guild-specific prefix if available
        console.log(`Guild ID: ${guildId}`);
        console.log(`Guild Prefix: ${guildPrefix}`);
      } catch (error) {
        console.error(`Error parsing guild config file for guild ${guildId}:`, error);
      }
    }

    // Execute the command if it exists
    if (command) {
      console.log(`Executing command: ${command.name}`);
      command.execute(message, args, guildPrefix); // Pass the guild-specific prefix
    }
  },
};
