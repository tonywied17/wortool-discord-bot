/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\commands\regimental\setup.js
 * Project: c:\Users\tonyw\AppData\Local\Temp\scp22807\home\bots\ReggieBot\commands\regimental
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Fri February 9th 2024 7:52:54 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
const { EmbedBuilder, SlashCommandBuilder, ChannelType } = require('discord.js');
const axios = require('axios');
require('dotenv').config()
const bearerToken = process.env.AUTH_SECRET;
const currentDate = new Date();
const today = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;


module.exports = {
  data: new SlashCommandBuilder()
    .setName('muster')
    .setDescription('Award a muster record for an Event or Drill.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('channels')
        .setDescription('Award a muster to an entire voice channel\'s connected user\'s.')
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
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('users')
        .setDescription('Award a muster to a single selected user.')
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
        .addUserOption(option =>
          option
            .setName('target')
            .setDescription('Select users.')
            .setRequired(true)
        )
    ),


  async execute(interaction) {

    const guildId = interaction.guild.id;
    const guildAvatar = interaction.guild.iconURL();
    if (interaction.options.getSubcommand() === 'users') {

      try {
        const response = await axios.get(`https://api.wortool.com/v2/musteruser/discord/${guildId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        enlistedUsersSingle = response.data;

        console.log(enlistedUsersSingle)

        const eventType = interaction.options.getString('type');
        const selectedUsers = [interaction.options.getUser('target')];
        

        const enlistedUsersData = await enlistedUsersSingle
          .filter((enlistedUser) => selectedUsers.some((user) => user.id === enlistedUser.discordId))
          .map((enlistedUser) => {
            console.log('Processing Enlisted User:', enlistedUser);

            const userData = {
              username: enlistedUser.username ? enlistedUser.username.replace(/[&\/\\#,+()$~%'`":]/g, '') : enlistedUser.username,
              nickname: enlistedUser.nickname ? enlistedUser.nickname.replace(/[&\/\\#,+()$~%'`":]/g, '') : enlistedUser.nickname,
              discordId: enlistedUser.discordId,
              regimentId: enlistedUser.regimentId,
              events: `${eventType === 'event' ? enlistedUser.events + 1 : enlistedUser.events }`,
              drills: `${eventType === 'drill' ? enlistedUser.drills + 1 : enlistedUser.drills }`,
              last_muster: today,
            };

            return userData;
          });

        try {
          const increaseResponse = await axios.put(`https://api.wortool.com/v2/musteruser/discord/increase/`, enlistedUsersData, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${bearerToken}`,
            },
          });

          console.log('Increase Response:', increaseResponse.data);
        } catch (error) {
          console.error('Error making increase request:', error);
        }

        const userMusterList = await enlistedUsersData.map((user) => {
          if (eventType === 'drill') {
            updatedCount = user.drills;
          } else if (eventType === 'event') {
            updatedCount = user.events;
          }

          return `> \`${user.nickname || user.username}\`  |  **${updatedCount}** ${uCase(eventType)}s`;
        });

        const embed = new EmbedBuilder()
          .setColor("#425678")
          .setTitle(`${uCase(eventType)} Muster`)
          .setThumbnail(guildAvatar)
          .addFields({ name: `\`${enlistedUsersData.length}\` User's Mustered`, value: `${userMusterList.join('\n')}` })
          .setTimestamp();

          // {  }
        const replyMessage = await interaction.reply({
          embeds: [embed],
          ephemeral: false,
          fetchReply: true,
        });

        await replyMessage.react('✅');

      } catch (error) {
        console.error('Error fetching or processing enlisted users:', error);
        await interaction.reply({
          content: `User was not found in the muster records.`,
          ephemeral: true
        });
      }

      return;


    } else {


      const eventType = interaction.options.getString('type');
      const selectedChannel = interaction.options.getChannel('channel');

      if (selectedChannel.type !== ChannelType.GuildVoice) {
        return interaction.reply('Please select a voice channel.');
      }

      try {
        const updatedResponse = await axios.get(`https://api.wortool.com/v2/musteruser/discord/${guildId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        enlistedUsersChannel = updatedResponse.data;

        const channelMembers = [];
        const enlistedChannelMembers = [];

        await interaction.guild.channels.cache.get(selectedChannel.id).members.forEach((member) => {
          channelMembers.push(member.user);
        });

        channelMembers.forEach((channelMember) => {
          const enlistedUser = enlistedUsersChannel.find((user) => user.discordId === channelMember.id);
          if (enlistedUser) {
            const memberInfo = {
              discordId: enlistedUser.discordId,
              username: channelMember.username ? channelMember.username.replace(/[&\/\\#,+()$~%'`":]/g, '') : channelMember.username,
              nickname: enlistedUser.nickname ? enlistedUser.nickname.replace(/[&\/\\#,+()$~%'`":]/g, '') : enlistedUser.nickname,
              regimentId: enlistedUser.regimentId,
              events: `${eventType === 'event' ? enlistedUser.events + 1 : enlistedUser.events }`,
              drills: `${eventType === 'drill' ? enlistedUser.drills + 1 : enlistedUser.drills }`,
            };
            enlistedChannelMembers.push(memberInfo);
          }
        });

        try {
          const increaseResponse = await axios.put(`https://api.wortool.com/v2/musteruser/discord/increase/`, enlistedChannelMembers, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${bearerToken}`,
            },
          });

          console.log('Increase Response:', increaseResponse.data);
        } catch (error) {
          console.error('Error making increase request:', error);
        }

        const membersList = enlistedChannelMembers.map((member) => {
          return `> \`${member.nickname || member.username}\`  |  **${eventType === 'event' ? member.events : member.drills}** ${uCase(eventType)}s`;
        });

        const embed = new EmbedBuilder()
          .setColor("#425678")
          .setTitle(`${uCase(eventType)} Muster`)
          .setThumbnail(guildAvatar)
          .addFields({ name: `\`${enlistedChannelMembers.length}\` User's Mustered`, value: `${membersList.join('\n')}` })
          .setTimestamp();

        const replyMessage = await interaction.reply({
          embeds: [embed],
          ephemeral: false,
          fetchReply: true,
        });

        await replyMessage.react('✅');
      } catch (error) {
        console.error('Error fetching or processing channel members:', error);
      }
    }

    return;

    function uCase(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }


  }
}