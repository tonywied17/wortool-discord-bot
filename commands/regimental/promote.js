/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\commands\regimental\promote.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Monday February 12th 2024
 * Author: Tony Wiedman
 * -----
 * Last Modified: Mon February 12th 2024 8:20:49 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2024 MolexWorks / Tone Web Design
 */

const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Permissions } = require('discord.js');
const axios = require('axios');
require('dotenv').config();
const bearerToken = process.env.AUTH_SECRET;

module.exports = {
  isAdmin: true,
  isRoleManager: false,
  data: new SlashCommandBuilder()
    .setName('promote')
    .setDescription("Promote a user to a regimental manager.")
    .addUserOption(option =>
      option.setName("member").setDescription("Select a user.").setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply();
    const guildId = interaction.guild.id;
    const user = interaction.options.getUser("member");

    try {
      const regimentsResponse = await axios.get(`https://api.wortool.com/v2/regiments/g/${guildId}/discordGuild`, { headers: { Authorization: `Bearer ${bearerToken}` } });
      const regimentId = regimentsResponse.data.regimentId;

      console.log(regimentId);

      const usersResponse = await axios.get(`https://api.wortool.com/v2/regiments/${regimentId}/users`, { headers: { Authorization: `Bearer ${bearerToken}` } });
      const users = usersResponse.data;

      console.log(users);

      const targetUser = users.find(u => u.discordId === user.id);
      
      console.log(targetUser);

      if (targetUser) {
        await axios.put(`https://api.wortool.com/v2/auth/${targetUser.id}/setModeratorDiscord`, {}, { headers: { Authorization: `Bearer ${bearerToken}` } });
      }

      const role = interaction.guild.roles.cache.find(r => r.name === "WoRTool Manager");
      if (!role) {
        return interaction.editReply("WoRTool Manager role does not exist in this server.");
      }
      const member = await interaction.guild.members.fetch(user.id);
      if (!member.roles.cache.has(role.id)) {
        await member.roles.add(role);
      }

      if (targetUser) {
        await interaction.editReply(`<@${user.id}> has been promoted to a regimental manager and assigned the "WoRTool Manager" role.\n\nThey will need to **re-login** to wortool.com to access the web-based regimental management tools.`);
      } else {
        await interaction.editReply(`<@${user.id}>  has been assigned the "WoRTool Manager" role.\n\n They should sign up on wortool.com and sync their Discord & Regiment in the "Linked Accounts" section if they would like access to the web-based features. Otherwise, they can use the bot commands to manage the regiment.`);
      }
    } catch (error) {
      console.error("Error promoting user:", error);
      await interaction.editReply("An error occurred while trying to promote the user.");
    }
  },
};
