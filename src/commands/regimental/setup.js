/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\commands\regimental\setup.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Fri August 4th 2023 3:58:12 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */


const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../../../config.json');
const fs = require('fs');
const path = require("path");

module.exports = {
  name: "setup",
  description: "Add/Update your regiment's Discord server to the application.",
  aliases: ["init", "add", "update"],
  usage: `<usa/csa>`,
  category: "Regimental",
  isAdmin: true,
  async execute(message, args, guildPrefix, client) {
    const guildId = message.guild.id;
    const guildConfigPath = path.join(__dirname, '../../../guilds', `${guildId}.json`);
    const guildConfig = JSON.parse(fs.readFileSync(guildConfigPath, 'utf8'));
    const prefix = guildConfig && guildConfig.prefix ? guildConfig.prefix : config.defaultPrefix;

    if(!args[0] || (args[0].toUpperCase() !== 'USA' && args[0].toUpperCase() !== 'CSA')) {
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


      message.channel.send({ embeds: [embed] }).then((msg) => {

        // Send data to the backend API
        axios.post('https://api.tonewebdesign.com/pa/regiments/create', {
          guildId: guildId,
          guildName: guildName,
          guildAvatar: guildAvatar,
          guildInvite: guildInvite,
          ownerId: ownerId,
          side: side,
          memberCount: memberCount,
        })
        .then(response => {
          console.log(response.data);
          message.reply(`Your regiment's discord data has been synchronized to the application.`);
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
};
