/*
 * File: c:\Users\tonyw\AppData\Local\Temp\scp50442\home\bots\ReggieBot\bot.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Saturday August 5th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat August 5th 2023 3:41:53 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { loadCommands } = require('./src/handlers/commandHandler');
const guildCreate = require('./src/events/guildCreate');
const messageCreate = require('./src/events/messageCreate');
const guildMemberAdd = require('./src/events/guildMemberAdd');
const guildMemberRemove = require('./src/events/guildMemberRemove');
const guildUpdate = require('./src/events/guildUpdate');

const config = require('./config.json');

/**
 * The bot's Discord client
 * @type {Client}
 */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

/**
 * Loads all commands from the commands folder
 * @param {Client} client The bot's Discord client
 * @param {string} dir The directory to load commands from
 * @returns {void}
 */
loadCommands(client, './src/commands');

/**
 * Bot event handlers
 * @event Client#ready - Emitted when the bot is ready
 * @event Client#guildCreate - Emitted when the bot joins a guild
 * @event Client#guildMemberAdd - Emitted when a member joins a guild
 * @event Client#guildMemberRemove - Emitted when a member leaves a guild
 * @event Client#guildUpdate - Emitted when a guild is updated
 * @event Client#messageCreate - Emitted when a message is created
 */
client.on('guildCreate', guild => {
  guildCreate.execute(guild);
});
client.on('guildMemberAdd', member => {
  guildMemberAdd.execute(member);
});
client.on('guildMemberRemove', member => {
  guildMemberRemove.execute(member);
});
client.on('guildMemberRemove', member => {
  guildMemberRemove.execute(member);
});
client.on('guildUpdate', (oldGuild, newGuild) => {
  guildUpdate.execute(oldGuild, newGuild);
});
client.on('messageCreate', message => {
  const guildId = message.guild?.id;
  if (!guildId) return;
  const guildConfigPath = path.join(__dirname, 'guilds', `${guildId}.json`);
  let guildPrefix = config.defaultPrefix; 
  if (fs.existsSync(guildConfigPath)) {
    try {
      const guildConfig = JSON.parse(fs.readFileSync(guildConfigPath, 'utf8'));
      guildPrefix = guildConfig.prefix || config.defaultPrefix; // Use the guild-specific prefix if available
    } catch (error) {
      console.error(`Error parsing guild config file for guild ${guildId}:`, error);
    }
  }
  messageCreate.execute(client, guildPrefix, message); // Pass the guild-specific prefix
});

/**
 * Logs the bot in
 * @param {string} token The bot's token
 * @returns {Promise<string>}
 */
client.login(config.token);
