/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\commands\regimental\setup.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat November 25th 2023 10:31:18 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config()
const fs = require('fs');
const path = require("path");
const bearerToken = process.env.AUTH_SECRET;

module.exports = {
  name: "setup",
  description: "Add/Update your regiment's Discord server to the application.",
  aliases: ["init", "add", "update"],
  usage: `<usa/csa>`,
  category: "Regimental",
  isAdmin: true,
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Add/Update your regiment\'s Discord server to the application.')
    .addStringOption(option =>
      option
        .setName('side')
        .setDescription('Choose your side (USA or CSA)')
        .setRequired(true)
        .addChoices(
          { name: 'USA', value: 'USA' },
          { name: 'CSA', value: 'CSA' }
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


    if(interaction){
      const side = interaction.options.getString('side').toUpperCase();
    
      if (!['USA', 'CSA'].includes(side)) {
        return interaction.reply(`Please choose a valid side.`);
      }
  
      try {
        let invite = await interaction.channel.createInvite({
          maxAge: 0, // 0 = infinite expiration
          maxUses: 0 // 0 = infinite uses
        }).catch(console.error);
  
        const guildName = interaction.guild.name;
        const guildAvatar = interaction.guild.iconURL();
        const guildInvite = invite.url;
        const ownerId = interaction.user.id;
        let memberCount = interaction.guild.memberCount;
        const embed = new EmbedBuilder()
          .setColor("#425678")
          .setTitle("Regiment Setup Information")
          .setThumbnail(guildAvatar)
          .addFields({ name: "ID", value: guildId })
          .addFields({ name: "Name", value: guildName })
          .addFields({ name: "Side", value: side })
          .addFields({ name: "Avatar", value: guildAvatar })
          .addFields({ name: "Invite", value: guildInvite })
          // .addFields({ name: "Member Count", value: memberCount })
          .addFields({ name: "Owner Discord ID", value: ownerId })
          .setTimestamp();
  
        const config = {
          headers: {
            'Authorization': `Bearer ${bearerToken}`,
          }
        };
  
        interaction.reply({ embeds: [embed] }).then(() => {
          axios.post('https://api.tonewebdesign.com/pa/regiments/create', {
            guildId: guildId,
            guildName: guildName,
            guildAvatar: guildAvatar,
            guildInvite: guildInvite,
            ownerId: ownerId,
            side: side,
            memberCount: memberCount,
            prefix: prefix
          }, config)
            .then(response => {
              console.log(response.data);
              interaction.followUp(`Your regiment's discord data has been synchronized to the application.\n ## You may have to re-login to WoRTool to access the dashboards.`);
            })
            .catch(error => {
              console.error(error);
              interaction.followUp('❌ An error occurred while setting up the regiment.');
            });
        });
  
      } catch (error) {
        console.error(error);
        interaction.followUp('❌ An error occurred while setting up the regiment.');
      }
    }else{

      if (!args[0] || (args[0].toUpperCase() !== 'USA' && args[0].toUpperCase() !== 'CSA')) {
        return message.reply(`Please choose a side. \`${prefix}setup <usa/csa>\``);
      }
  
      try {
        let invite = await message.channel.createInvite({
          maxAge: 0, // 0 = infinite expiration
          maxUses: 0 // 0 = infinite uses
        }).catch(console.error);
  
        const guildId = message.guild.id;
        const guildName = message.guild.name;
        const guildAvatar = message.guild.iconURL();
        const guildInvite = invite.url;
        const ownerId = message.author.id;
        const side = args[0].toUpperCase();
  
        let member = message.member;
        let serverNickname = member ? member.displayName : null;
        let memberCount = message.guild.memberCount;
        console.log(message.guild.memberCount)
  
        const allMembers = await message.guild.members.fetch();
        const memberData = allMembers.map(member => {
          return {
            id: member.id,
            nickname: member.nickname || member.user.username,
            avatarURL: member.user.displayAvatarURL({ format: 'jpg', dynamic: true })
          };
        });
  
  
        const embed = new EmbedBuilder()
          .setColor("#425678")
          .setTitle("Regiment Setup Information")
          .setThumbnail(guildAvatar)
          .addFields({ name: "ID", value: guildId })
          .addFields({ name: "Name", value: guildName })
          // .addFields({ name: "Member Count", value: memberCount })
          .addFields({ name: "Side", value: side })
          .addFields({ name: "Avatar", value: guildAvatar })
          .addFields({ name: "Invite", value: guildInvite })
          .addFields({ name: "Owner Discord ID", value: ownerId })
          .addFields({ name: "Owner Nickname", value: serverNickname })
          // .addFields({ name: "Regiment API", value: "https://api.tonewebdesign.com/pa/regiments" })
          // .addFields({ name: "Discord App API", value: `https://api.tonewebdesign.com/pa/discord/guild/${guildId}/get`})
          .setTimestamp();
  
  
          const config = {
            headers: {
              'Authorization': `Bearer ${bearerToken}`,
            }
          };
  
        /**
         * Use an axios post request to send the guild data to the API.
         * @param {string} url - The API endpoint
         * @param {object} data - The guild data
         * @returns {Promise<void>}
         */
        message.channel.send({ embeds: [embed] }).then((msg) => {
  
          axios.post('https://api.tonewebdesign.com/pa/regiments/create', {
            guildId: guildId,
            guildName: guildName,
            guildAvatar: guildAvatar,
            guildInvite: guildInvite,
            ownerId: ownerId,
            side: side,
            memberCount: memberCount,
            // members: memberData,
            prefix: prefix
          }, config)
            .then(response => {
              console.log(response.data);
              message.reply(`Your regiment's discord data has been synchronized to the application.\n ## You may have to re-login to WoRTool to access the dashboards.`);
            })
            .catch(error => {
              console.error(error);
              msg.react('❌');
            });
        });
  
      } catch (error) {
        console.error(error);
        message.reply("An error occurred while setting up the regiment.");
      }
    }

    }

  
};
