/*
 * File: c:\Users\tonyw\AppData\Local\Temp\scp50442\home\bots\ReggieBot\bot.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Saturday August 5th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Thu November 30th 2023 2:11:01 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

const { Client, Collection, Events, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { loadCommands } = require('./src/handlers/commandHandler');
const discordEvents = require('./src/events/Discord')
require('dotenv').config()
let guildPrefix = process.env.DEFAULT_PREFIX;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
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
client.on('ready', client => {
  discordEvents.onReady.execute(client);
})
// guildCreate - Emitted whenever the client joins a guild.
client.on('guildCreate', guild => {
  discordEvents.guildCreate.execute(guild, client);
});
// guildMemberAdd - Emitted whenever a user joins a guild.
client.on('guildMemberAdd', member => {
  discordEvents.guildMemberAdd.execute(member);
});
// guildMemberRemove - Emitted whenever a member leaves a guild, or is kicked.
client.on('guildMemberRemove', member => {
  discordEvents.guildMemberRemove.execute(member);
});
// guildUpdate - Emitted whenever a guild is updated - e.g. server name, guild avatar change.
client.on('guildUpdate', (oldGuild, newGuild) => {
  discordEvents.guildUpdate.execute(oldGuild, newGuild);
});
//messageCreate - message commands
client.on('messageCreate', async message => { 
  discordEvents.messageCreate.execute(client, guildPrefix, message)
});
client.on('debug', console.log);

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isCommand()) return;
  const { commandName } = interaction;
  if (!client.commands.has(commandName)) {
    return;
  }
  const command = client.commands.get(commandName);
  if (command && (command.isAdmin && 
    !interaction.member?.permissions.has(PermissionsBitField.Flags.Administrator) && 
    interaction.user.id !== '281639399152943105')) {
    return interaction.reply("You must be an admin to execute this command.");
  }
  if (command && (command.isDev && interaction.author.id !== '281639399152943105')) {
    return message.reply("This command is reserved for developers/testing.")
  }
  try {
    let message, args = "";
    await client.commands.get(commandName).execute(message, args, guildPrefix, client, interaction);
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
