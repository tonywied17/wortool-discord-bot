/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\events\guildMemberRemove.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Friday August 4th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Fri August 4th 2023 3:51:41 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
const axios = require('axios');

module.exports = {
  name: 'guildMemberRemove',
  execute(member) {
    const guild = member.guild;
    const guildId = guild.id;
    const memberCount = guild.memberCount;

    console.log(`A member has left the guild: ${member.user.tag}`);
    
    axios.post(`https://api.tonewebdesign.com/pa/regiments/${guildId}/membercount`, {
      memberCount: memberCount,
    })
    .then((res) => {
      console.log(`statusCode: ${res.statusCode}`)
      console.log(res)
    }
    )
    .catch((error) => {
      console.error(error)
    })
    
  },
};