/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\commands\utility\prefix.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat November 25th 2023 11:39:29 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 MolexWorks / Tone Web Design
 */
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const data = new SlashCommandBuilder()
  .setName('prefix')
  .setDescription("Change the bot prefix")
  .addStringOption(option =>
    option.setName('newprefix')
      .setDescription('New prefix')
      .setRequired(true)
  );

module.exports = {
  name: 'prefix',
  description: 'Change the bot prefix',
  usage: '<new prefix>',
  isAdmin: true,
  data,
  /**
   * The `prefix` command changes the bot prefix.
   * @param {*} message - The message
   * @param {*} args - The arguments
   * @param {*} guildPrefix - The guild prefix
   * @param {*} client - The client
   * @returns - {void}
   */
  async execute(message, args, guildPrefix, client, interaction) {
    try {
      const guildId = interaction ? interaction.guildId : message.guild.id;
      const newPrefix = interaction ? interaction.options.getString('newprefix') : args[0];

      if (!newPrefix) {
        return interaction ? interaction.reply('Please provide a new prefix.') : message.reply('Please provide a new prefix.');
      }

      await axios.put(`https://api.tonewebdesign.com/pa/regiments/g/${guildId}/updatePrefix`, {
        prefix: newPrefix
      });

      const embed = new EmbedBuilder()
        .setColor("#425678")
        .setTitle('Prefix Updated')
        .setDescription(`The bot prefix has been updated to: \`${newPrefix}\`, use \`${newPrefix}help\` to see available commands.`);

      return interaction ? interaction.reply({ embeds: [embed] }) : message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return interaction ? interaction.reply('An error occurred while executing the prefix command.') : message.reply('An error occurred while executing the prefix command.');
    }
  },
};
