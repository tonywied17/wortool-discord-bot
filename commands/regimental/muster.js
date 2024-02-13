/*
 * File: setup.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Description: Command for awarding muster records for Events or Drills.
 * Author: Tony Wiedman
 * Last Modified: Mon February 12th 2024 6:55:40 
 */

const { EmbedBuilder, SlashCommandBuilder, ChannelType } = require('discord.js');
const axios = require('axios');
require('dotenv').config();
const bearerToken = process.env.AUTH_SECRET;

// Helper function to format dates
const formatDate = (date) => {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

// Today's date in YYYY-MM-DD format
const today = formatDate(new Date());

module.exports = {
  isAdmin: false,
  isRoleManager: true,
  data: new SlashCommandBuilder()
    .setName('muster')
    .setDescription('Award a muster record for an Event or Drill.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('channels')
        .setDescription('Award a muster to an entire voice channel\'s connected users.')
        .addStringOption(option =>
          option.setName('type').setDescription('Select event or drill.').setRequired(true)
            .addChoices({ name: 'Event', value: 'event' }, { name: 'Drill', value: 'drill' }))
        .addChannelOption(option =>
          option.setName('channel').setDescription('Select a voice channel.').setRequired(true).addChannelTypes(ChannelType.GuildVoice)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('users')
        .setDescription('Award a muster to selected users.')
        .addStringOption(option =>
          option.setName('type').setDescription('Select event or drill.').setRequired(true)
            .addChoices({ name: 'Event', value: 'event' }, { name: 'Drill', value: 'drill' }))
        .addUserOption(option =>
          option.setName('target').setDescription('Select a user.').setRequired(true)
        )
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const guildAvatar = interaction.guild.iconURL();
    const eventType = interaction.options.getString('type');
    let responseData, embed, replyMessage;

    const fetchEnlistedUsers = async () => {
      const response = await axios.get(`https://api.wortool.com/v2/musteruser/discord/${guildId}`, {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      });
      return response.data;
    };

    const updateMusterRecords = async (usersData) => {
      await axios.put(`https://api.wortool.com/v2/musteruser/discord/increase/`, usersData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
      });
    };

    const processUsers = (users, singleUser = false) => {
      const processedUsers = users.map(user => ({
        ...user,
        events: eventType === 'event' ? user.events + 1 : user.events,
        drills: eventType === 'drill' ? user.drills + 1 : user.drills,
        last_muster: today,
      }));

      updateMusterRecords(processedUsers).catch(console.error);

      const musterList = processedUsers.map(user => `> \`${user.nickname || user.username}\`  |  **${eventType === 'event' ? user.events : user.drills}** ${capitalize(eventType)}s`);
      embed = new EmbedBuilder()
        .setColor("#425678")
        .setTitle(`${capitalize(eventType)} Muster`)
        .setThumbnail(guildAvatar)
        .addFields({ name: `\`${processedUsers.length}\` User's Mustered`, value: musterList.join('\n') })
        .setTimestamp();

      return embed;
    };

    const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

    try {
      responseData = await fetchEnlistedUsers();

      if (interaction.options.getSubcommand() === 'users') {
        const selectedUser = interaction.options.getUser('target');
        const enlistedUser = responseData.find(user => user.discordId === selectedUser.id);
        if (!enlistedUser) throw new Error('## User not found in the muster records.\n Use `\/enlist` to add the user to the company roster.');

        embed = processUsers([enlistedUser], true);
      } else {
        const selectedChannel = interaction.options.getChannel('channel');
        if (selectedChannel.type !== ChannelType.GuildVoice) {
          return interaction.reply('Please select a voice channel.');
        }

        const channelMembers = selectedChannel.members.map(member => member.user);
        const enlistedUsers = responseData.filter(user => channelMembers.some(channelMember => channelMember.id === user.discordId));
        embed = processUsers(enlistedUsers);
      }

      replyMessage = await interaction.reply({
        embeds: [embed],
        ephemeral: false,
        fetchReply: true,
      });
      await replyMessage.react('✅');
    } catch (error) {
      console.error(error.message);
      interaction.reply({
        content: error.message || 'An error occurred while processing the command.',
        ephemeral: true,
      });
    }
  },
};
