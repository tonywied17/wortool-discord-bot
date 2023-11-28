/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\commands\regimental\setup.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Tue November 28th 2023 12:06:41 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
const { EmbedBuilder, SlashCommandBuilder, ChannelType } = require('discord.js');
const axios = require('axios');
require('dotenv').config()
const fs = require('fs');
const path = require("path");
const bearerToken = process.env.AUTH_SECRET;

module.exports = {
  name: "muster",
  description: "Award a muster record for an Event or Drill.",
  usage: `Can only be used as a slash command use \`\\muster\``,
  category: "Regimental",
  isAdmin: true,
  data: new SlashCommandBuilder()
    .setName('muster')
    .setDescription('Award a muster record for an Event or Drill.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('users')
        .setDescription('Get information about events/drills in a specific voice channel.')
        .addStringOption(option =>
          option
            .setName('type')
            .setDescription('Select event or drill.')
            .setRequired(true)
            .addChoices(
              { name: 'Event', value: 'event' },
              { name: 'Drill', value: 'drill' }
            )
        )
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('Select a voice channel.')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice)
        )
    ),
    

  async execute(message, args, guildPrefix, client, interaction) {
    const guildId = (interaction ? interaction.guild.id : message.guild.id);
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
      prefix = process.env.DEFAULT_PREFIX;
    }



        const eventType = interaction.options.getString('type');
        const selectedChannel = interaction.options.getChannel('channel');
    
        if (selectedChannel.type !== ChannelType.GuildVoice) {
          return interaction.reply('Please select a voice channel.');
        }
    
        console.log('SELECTED CHANNEL: ' + selectedChannel)
        const channelMembers = [];

        await interaction.guild.channels.cache.get(selectedChannel.id).members.forEach((member)=> {
            channelMembers.push(member.user)       
        })

        // console.log(channelMembers)
        const membersList = channelMembers.map(member => `> ${member}`).join('\n');
    
        const replyMessage = await interaction.reply({
            content: `${channelMembers.length} members were found in ${selectedChannel}, and theoretically, we would award an ${eventType} here.\n\n Users Mustered:\n${membersList}`,
            ephemeral: false,
            fetchReply: true,
          });
          
          await replyMessage.react('✅');
          
        return;



  
}
}
