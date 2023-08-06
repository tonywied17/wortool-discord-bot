/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\index.js
 * Project: c:\Users\tonyw\AppData\Local\Temp\scp40731\home\bots\ReggieBot
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat August 5th 2023 3:45:02 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

const { ShardingManager } = require('discord.js');
const path = require('path');
const config = require('./config.json');

const manager = new ShardingManager(path.join(__dirname, 'bot.js'), {
  token: config.token,
});

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

manager.spawn();

