/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\events\guildCreate.js
 * Project: c:\Users\tonyw\AppData\Local\Temp\scp01946\home\bots\ReggieBot\src\events
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat November 4th 2023 2:01:34 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env

/**
 * The `guildCreate` event is emitted when the client joins a guild.
 * @param {Guild} guild The guild that was joined
 * @returns {void}
 */
module.exports = {
  name: 'guildCreate',

  /**
   * The `guildCreate` event is emitted when the client joins a guild.
   * @param {*} guild - The guild that was joined
   */
  execute(guild) {
    const guildConfigPath = path.join(__dirname, '../../guilds', `${guild.id}.json`);

    if (!fs.existsSync(guildConfigPath)) {
      const guildConfig = {
        prefix: process.env.DEFAULT_PREFIX || 'wor.', // Use the environment variable or a default value
      };

      fs.writeFileSync(guildConfigPath, JSON.stringify(guildConfig, null, 2));
    }
  },
};
