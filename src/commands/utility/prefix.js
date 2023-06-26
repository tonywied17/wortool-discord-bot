const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
const guildsFolderPath = './guilds/';

module.exports = {
  name: 'prefix',
  description: 'Change the bot prefix',
  usage: '<new prefix>',
  isAdmin: true,
  execute(message, args) {
    if (!args.length) {
      return message.reply('Please provide a new prefix.');
    }

    // Get the guild ID
    const guildId = message.guild.id;

    // Load the guild configuration
    const guildConfigPath = `${guildsFolderPath}${guildId}.json`;
    let guildConfig = {};
    if (fs.existsSync(guildConfigPath)) {
      guildConfig = JSON.parse(fs.readFileSync(guildConfigPath, 'utf8'));
    }

    // Update the prefix in the guild configuration
    const newPrefix = args[0];
    guildConfig.prefix = newPrefix;

    // Save the updated guild configuration
    fs.writeFile(guildConfigPath, JSON.stringify(guildConfig, null, 2), (err) => {
      if (err) {
        console.error(err);
        return message.reply('An error occurred while updating the prefix.');
      }

      const embed = new EmbedBuilder()
        .setColor("#7c7d72")
        .setTitle('Prefix Updated')
        .setDescription(`The bot prefix has been updated to: \`${newPrefix}\`, use \`${newPrefix}help\` to see available commands.`);

      message.channel.send({ embeds: [embed] });
    });
  },
};
