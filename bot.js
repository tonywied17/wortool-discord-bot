/*
 * File: c:\Users\tonyw\AppData\Local\Temp\scp50442\home\bots\ReggieBot\bot.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Saturday August 5th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Fri February 9th 2024 10:41:16 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
let fetch;
import('node-fetch').then(module => {
    fetch = module.default;
});

let guildPrefix = process.env.DEFAULT_PREFIX;

require('dotenv').config();
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;

/**
 * Discord Client Intents
 */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

/**
 * Client Commands
 * @type {Collection<string, any>}
 * @description The client commands are handled in the commands directory.
 * The command files are named after the command they handle and are in the format of:
 * command-name.js
 */
client.commands = new Collection();
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);
for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

/**
 * Client Events
 * @type {Collection<string, any>}
 * @description The client events are handled in the handlers/events/discord directory.
 * The event files are named after the event they handle and are in the format of:
 * event-name.js
 */
const eventsPath = path.join(__dirname, 'handlers/events/discord');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

/**
 * Register Application Commands
 * @description This will register the application commands for the bot.
 */
const rest = new REST().setToken(token);
(async () => {
  try {
    console.log(`Started refreshing application (/) commands.`);
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );
    console.log(`Successfully reloaded application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();

/**
 * Logs the client in, establishing a websocket connection to Discord.
 * @param {string} token The token of the account to log in with
 * @returns {Promise<string>} Token of the account used
 */
client.login(process.env.TOKEN);
