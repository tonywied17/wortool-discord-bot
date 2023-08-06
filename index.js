/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\index.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat August 5th 2023 10:10:37 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

const { ShardingManager } = require('discord.js');
const path = require('path');
const config = require('./config.json');

/**
 * The `ShardingManager` class manages the creation of shards and communication with the Discord API.
 */
const manager = new ShardingManager(path.join(__dirname, 'bot.js'), {
  token: config.token,
});

/**
 * The `shardCreate` event is emitted when a new shard is created.
 * @param {Shard} shard The shard that was created
 */
manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

/**
 * Spawns shards and begins the bot's session.
 * @param {number} [shards='auto'] Number of shards to spawn, defaults to automatic sharding
 * @param {number} [delay=5500] How long to wait between spawning each shard, in milliseconds
 * @param {number} [timeout=30000] How long to wait for a shard to become ready before continuing to spawn more shards
 * @returns {Promise<Collection<number, Shard>>}
 */
manager.spawn();

