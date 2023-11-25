/*
 * File: c:\Users\tonyw\AppData\Local\Temp\scp50442\home\bots\ReggieBot\bot.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Saturday August 5th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat November 25th 2023 11:44:14 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { loadCommands } = require('./src/handlers/commandHandler');
const guildCreate = require('./src/events/guildCreate');
const messageCreate = require('./src/events/messageCreate');
const guildMemberAdd = require('./src/events/guildMemberAdd');
const guildMemberRemove = require('./src/events/guildMemberRemove');
const guildUpdate = require('./src/events/guildUpdate');
require('dotenv').config()
// require("dotenv").config({ path: "/home/tonewebdesign/envs/pa/.env" });
const config = require('./config.json');
let guildPrefix = process.env.DEFAULT_PREFIX;
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
loadCommands(client, path.join(__dirname, '/commands/'));

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
//messageCreate - message commands
client.on('messageCreate', async message => { 
  messageCreate.execute(client, guildPrefix, message)
});
// debugging? i forget honestly
client.on('debug', console.log);
// interaction/ slash command proccessing...
client.on(Events.InteractionCreate, async interaction => {
  console.log(`Interaction received: ${interaction.id} | ${interaction.type}`);
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;
  console.log(`Received interaction for command: ${commandName}`);

  if (!client.commands.has(commandName)) {
    console.log(`Command not found: ${commandName}`);
    return;
  }



  try {
    let message, args = "";
    await client.commands.get(commandName).execute(message, args, guildPrefix, client, interaction);
    console.log(`Command executed: ${commandName}`);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});



/**
 * Logs the client in, establishing a websocket connection to Discord.
 * @param {string} token The token of the account to log in with
 * @returns {Promise<string>} Token of the account used
 */
client.login(process.env.TOKEN);
