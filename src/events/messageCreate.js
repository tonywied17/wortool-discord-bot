/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\events\messageCreate.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat August 5th 2023 10:23:50 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
const { PermissionsBitField } = require('discord.js');
const config = require('../../config.json');
const fs = require('fs');
const path = require('path');

/**
 * The `messageCreate` event is emitted when a message is created.
 * @param {Message} message The created message
 * @param {*} client - The client
 * @param {*} prefix - The prefix
 * @returns {Promise<void>}
 */
module.exports = {
  name: "messageCreate",

  /**
   * The `messageCreate` event is emitted when a message is created.
   * @param {*} client - The client
   * @param {*} prefix - The prefix
   * @param {*} message - The created message
   * @returns - {Promise<void>}
   */
  execute(client, prefix, message) {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (command && (command.isAdmin && !message.member?.permissions.has(PermissionsBitField.Flags.Administrator))) {
      return message.reply("You must be an admin to execute this command. Hey @everyone, this guy thinks he's an admin! Look at him trying to use admin commands! BOO THIS MAN!!!");
    }

    const guildId = message.guild.id;
    const guildConfigPath = path.join(__dirname, '../../guilds', `${guildId}.json`);
    let guildPrefix = prefix;

    if (fs.existsSync(guildConfigPath)) {
      try {
        const guildConfig = JSON.parse(fs.readFileSync(guildConfigPath, 'utf8'));
        guildPrefix = guildConfig.prefix || prefix;
        console.log(`Guild ID: ${guildId}`);
        console.log(`Guild Prefix: ${guildPrefix}`);
      } catch (error) {
        console.error(`Error parsing guild config file for guild ${guildId}:`, error);
      }
    }

    if (command) {
      console.log(`Executing command: ${command.name}`);
      command.execute(message, args, guildPrefix, client);
    }
  },
};
