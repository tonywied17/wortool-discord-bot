/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\commands\utility\prefix.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat August 5th 2023 3:45:56 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
const guildsFolderPath = './guilds/';

/**
 * Changes the bot prefix
 */
module.exports = {
  name: 'prefix',
  description: 'Change the bot prefix',
  usage: '<new prefix>',
  isAdmin: true,

  /**
   * @param {*} message - The message object that was sent to trigger this command
   * @param {*} args - The arguments passed with this command
   * @param {*} guildPrefix - The prefix for this guild
   * @param {*} client - The Discord client
   * @returns - A message indicating whether the prefix was successfully updated
   */
  execute(message, args, guildPrefix, client) {
    try {
      if (!args.length) {
        return message.reply('Please provide a new prefix.');
      }

      const guildId = message.guild.id;
      const guildConfigPath = `${guildsFolderPath}${guildId}.json`;

      let guildConfig = {};
      if (fs.existsSync(guildConfigPath)) {
        guildConfig = JSON.parse(fs.readFileSync(guildConfigPath, 'utf8'));
      }

      const newPrefix = args[0];
      guildConfig.prefix = newPrefix;

      fs.writeFile(guildConfigPath, JSON.stringify(guildConfig, null, 2), (err) => {
        if (err) {
          console.error(err);
          return message.reply('An error occurred while updating the prefix.');
        }

        const embed = new EmbedBuilder()
          .setColor("#425678")
          .setTitle('Prefix Updated')
          .setDescription(`The bot prefix has been updated to: \`${newPrefix}\`, use \`${newPrefix}help\` to see available commands.`);

        message.channel.send({ embeds: [embed] });
      });
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while executing the prefix command.');
    }
  },
};
