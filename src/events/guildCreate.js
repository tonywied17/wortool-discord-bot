/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\events\guildCreate.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat November 25th 2023 10:21:31 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('discord.js');
/**
 * The `guildCreate` event is emitted when the client joins a guild.
 * @param {Guild} guild The guild that was joined
 * @returns {void}
 */
module.exports = {
  name: 'guildCreate',

  /**
   * The `guildCreate` event is emitted when the client joins a guild.
   * @param {*} guild - The guild that was joined
   */
  async execute(guild) {
    
    const clientId = process.env.CLIENT_ID;
    const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

    try {
      console.log('Started registering application (/) commands for guild:', guild.name);

      // Register guild-specific commands
      await rest.put(
        Routes.applicationGuildCommands(clientId, guild.id),
        { body: commands },
      );

      console.log('Successfully registered application (/) commands for guild:', guild.name);
    } catch (error) {
      console.error(error);
    }
  }
};
