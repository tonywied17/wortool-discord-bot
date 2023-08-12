/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\commands\utility\prefix.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat August 12th 2023 1:12:31 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

/**
 * The `prefix` command changes the bot prefix.
 */
module.exports = {
  name: 'prefix',
  description: 'Change the bot prefix',
  usage: '<new prefix>',
  isAdmin: true,

  /**
   * The `prefix` command changes the bot prefix.
   * @param {*} message - The message
   * @param {*} args - The arguments
   * @param {*} guildPrefix - The guild prefix
   * @param {*} client - The client
   * @returns - {void}
   */
  execute(message, args, guildPrefix, client) {
    try {
      if (!args.length) {
        return message.reply('Please provide a new prefix.');
      }
      const guildId = message.guild.id;
      const newPrefix = args[0];

      axios.put(`https://api.tonewebdesign.com/pa/regiments/g/${guildId}/updatePrefix`, {
        prefix: newPrefix
      })
        .then((response) => {
          console.log(response);
          const embed = new EmbedBuilder()
          .setColor("#425678")
          .setTitle('Prefix Updated')
          .setDescription(`The bot prefix has been updated to: \`${newPrefix}\`, use \`${newPrefix}help\` to see available commands.`);

          message.channel.send({ embeds: [embed] });
        })
        .catch((error) => {
          console.error(error);
        });
      
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while executing the prefix command.');
    }
  },
};
