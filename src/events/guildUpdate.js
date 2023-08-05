/*
 * File: c:\Users\tonyw\AppData\Local\Temp\scp43687\home\bots\ReggieBot\src\events\guildUpdate.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Saturday August 5th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat August 5th 2023 3:47:16 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
const axios = require('axios');

/**
 * Updates the member count for the guild
 */
module.exports = {
  name: 'guildUpdate',

  /**
   * @param {*} oldGuild - The old guild
   * @param {*} newGuild - The new guild
   */
  execute(oldGuild, newGuild) {
    if (oldGuild.name !== newGuild.name) {
      console.log(`Guild name changed from ${oldGuild.name} to ${newGuild.name}`);
    }

    if (oldGuild.icon !== newGuild.icon) {
      console.log(`Guild icon changed from ${oldGuild.icon} to ${newGuild.icon}`);
    }

    const guildId = newGuild.id;
    const updateData = {
      guildId: guildId,
      guildName: newGuild.name,
      guildAvatar: newGuild.iconURL()
    };

    axios.post(`https://api.tonewebdesign.com/pa/regiments/updateDiscord`, updateData)
      .then((res) => {
        console.log(`statusCode: ${res.status}`);
        console.log(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  },
};
