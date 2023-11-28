/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\events\guildCreate.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Tue November 28th 2023 12:06:49 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Collection } = require('discord.js');
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
  async execute(guild, client) {

    client.commands = new Collection();

    const foldersPath = path.join(__dirname, '../commands/');
    const commandFolders = fs.readdirSync(foldersPath);
    const commands = [];

    for (const folder of commandFolders) {
      const commandsPath = path.join(foldersPath, folder);
      const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

      for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
          client.commands.set(command.data.name, command);
          commands.push(command);
          console.log(`Command loaded: ${command.data.name}`);
        } else {
          console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
      }
    }
    
    const clientId = process.env.CLIENT_ID;
    const rest = new REST().setToken(process.env.TOKEN);

    try {
      console.log('Started registering application (/) commands for guild:', guild.name);

      const commandData = commands.map(command => ({
        name: command.data.name,
        description: command.data.description,
        options: command.data.options || [],
      }));


      await rest.put(
        Routes.applicationGuildCommands(clientId, guild.id),
        { body: commandData },
      );

      console.log('Successfully registered application (/) commands for guild:', guild.name);
    } catch (error) {
      console.error(error);
    }
  }
};
