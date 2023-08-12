/*
 * File: c:\Users\tonyw\AppData\Local\Temp\scp50442\home\bots\ReggieBot\bot.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Saturday August 5th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat August 12th 2023 1:38:37 
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

const axios = require('axios');

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
 * Loads all commands from the `commands` folder.
 * @param {Client} client The client
 */
loadCommands(client, './src/commands');

/**
 * The `ready` event is emitted when the client becomes ready to start working.
 * @param {Client} client The client
 */
// guildCreate - Emitted whenever the client joins a guild.
client.on('guildCreate', guild => {
  guildCreate.execute(guild);
});
// guildMemberAdd - Emitted whenever a user joins a guild.
client.on('guildMemberAdd', member => {
  guildMemberAdd.execute(member);
});
// guildMemberRemove - Emitted whenever a member leaves a guild, or is kicked.
client.on('guildMemberRemove', member => {
  guildMemberRemove.execute(member);
});
// guildUpdate - Emitted whenever a guild is updated - e.g. server name, guild avatar change.
client.on('guildUpdate', (oldGuild, newGuild) => {
  guildUpdate.execute(oldGuild, newGuild);
});

/**
 * The `messageCreate` event is emitted when a message is created.
 * This function will execute the command if it exists using either the guild's prefix or the default prefix.
 * @param {Message} message The created message
 * @returns {Promise<void>}
 */
client.on('messageCreate', async message => { 
  const guildId = message.guild?.id;
  let guildPrefix = config.defaultPrefix;

  if (!guildId) return;

  try {
    const response = await axios.get(`https://api.tonewebdesign.com/pa/regiments/g/${guildId}/discordGuild`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    guildPrefix = response.data.prefix;
  } catch (error) {
    const guildConfigPath = path.join(__dirname, 'guilds', `${guildId}.json`);
    console.log(error);
    const guildConfig = JSON.parse(fs.readFileSync(guildConfigPath, 'utf8'));
    guildPrefix = guildConfig.prefix || config.defaultPrefix; 
  }
  messageCreate.execute(client, guildPrefix, message); 
});


/**
 * Logs the client in, establishing a websocket connection to Discord.
 * @param {string} token The token of the account to log in with
 * @returns {Promise<string>} Token of the account used
 */
client.login(config.token);
