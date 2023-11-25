/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\handlers\commandHandler.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat November 25th 2023 11:43:25 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
const { REST, Routes, Collection } = require('discord.js');
const fs = require("fs");
const path = require("path");
require('dotenv').config()
const axios = require('axios');
/**
 * Loads all commands from the specified directory.
 * @param {Client} client The client
 * @param {string} dir The directory to load from
 * @returns {void}
 */
module.exports = {

  /**
   * Loads all commands from the specified directory.
   * @param {*} client - The client
   * @param {*} dir - The directory to load from
   */
  async loadCommands(client, dir) {
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

    // console.log('Commands:', commands);
    // console.log('Commands loaded:', commands);

    const rest = new REST().setToken(process.env.TOKEN);

    try {
      const response = await axios.get('https://api.tonewebdesign.com/pa/regiments');
      const guildData = response.data;

      // console.log('API Response:', guildData);

      const guildIds = guildData.map(data => data.guild_id);

      const commandData = commands.map(command => ({
        name: command.data.name,
        description: command.data.description,
        options: command.data.options || [],
      }));

      // console.log('Command Data:', commandData);

      for (const guildId of guildIds) {
        await rest.put(
          Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
          { body: commandData },
        );

        console.log(`Slash commands registered for guild ${guildId}`);
      }
    } catch (error) {
      console.error('Error fetching and registering slash commands globally:', error.message);
    }
  },

};
