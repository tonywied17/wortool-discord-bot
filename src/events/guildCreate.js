/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\events\guildCreate.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Fri August 4th 2023 3:29:36 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

module.exports = {
  name: 'guildCreate',
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
