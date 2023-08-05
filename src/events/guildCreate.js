/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\events\guildCreate.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat August 5th 2023 3:46:15 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

/**
 * Creates a config file for the guild if one does not already exist
 */
module.exports = {
  name: 'guildCreate',

  /**
   * @param {*} guild - The guild that the bot joined
   */
  execute(guild) {
    const guildConfigPath = path.join(__dirname, '../../guilds', `${guild.id}.json`);

    if (!fs.existsSync(guildConfigPath)) {
      const guildConfig = {
        prefix: config.defaultPrefix,
      };

      fs.writeFileSync(guildConfigPath, JSON.stringify(guildConfig, null, 2));
    }
  },
};
