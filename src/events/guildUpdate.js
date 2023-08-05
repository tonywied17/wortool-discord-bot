/*
 * File: c:\Users\tonyw\AppData\Local\Temp\scp43687\home\bots\ReggieBot\src\events\guildUpdate.js
 * Project: c:\Users\tonyw\AppData\Local\Temp\scp41803\home\bots\ReggieBot\src\events
 * Created Date: Saturday August 5th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat August 5th 2023 4:21:22 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
const axios = require('axios');

module.exports = {
  name: 'guildUpdate',
  execute(oldGuild, newGuild) {
    // Check if the guild name has changed
    if (oldGuild.name !== newGuild.name) {
      console.log(`Guild name changed from ${oldGuild.name} to ${newGuild.name}`);
    }

    // Check if the guild icon has changed
    if (oldGuild.icon !== newGuild.icon) {
      console.log(`Guild icon changed from ${oldGuild.icon} to ${newGuild.icon}`);
    }

    // Prepare the request data
    const guildId = newGuild.id;
    const updateData = {
      guildId: guildId,
      guildName: newGuild.name,
      guildAvatar: newGuild.iconURL()
    };

    // Make the axios request
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
