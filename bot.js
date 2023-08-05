/*
 * File: c:\Users\tonyw\AppData\Local\Temp\scp50442\home\bots\ReggieBot\bot.js
 * Project: c:\Users\tonyw\AppData\Local\Temp\scp50442\home\bots\ReggieBot
 * Created Date: Saturday August 5th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat August 5th 2023 4:00:37 
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

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

// Load commands
loadCommands(client, './src/commands');

// Events
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
  let guildPrefix = config.defaultPrefix; // Default prefix

  // Check if the guild-specific configuration file exists
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

client.login(config.token);
