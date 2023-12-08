/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\events\messageCreate.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Fri December 8th 2023 10:19:27 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
const { PermissionsBitField } = require('discord.js');

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
  async execute(client, prefix, message) {
    const guildId = message.guild?.id;
    let guildPrefix = prefix || process.env.DEFAULT_PREFIX;
    

  
    if (!guildId) return;
  
    try {
      const response = await axios.get(`https://api.wortool.com/v2/regiments/g/${guildId}/discordGuild`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      guildPrefix = response.data.prefix;
    } catch (error) {


      guildPrefix = process.env.DEFAULT_PREFIX; 
    }
    
    
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if(message.author.id == '281639399152943105'){
      // message.reply('Hey, you\'re my dad!');
    }

    if (command && (command.isAdmin && 
      !message.member?.permissions.has(PermissionsBitField.Flags.Administrator) && 
      message.author.id !== '281639399152943105')) {
      
      return message.reply("You must be an admin to execute this command. Hey @everyone, this guy thinks he's an admin! Look at him trying to use admin commands! BOO THIS MAN!!!");
  }

  if (command && (command.isDev && message.author.id !== '281639399152943105')) {
    return message.reply("This command is reserved for developers/testing.")
  }
  
  if (command) {
    console.log(`Executing command: ${command.name}`);
    command.execute(message, args, guildPrefix, client);
  }
  
    
  },
};