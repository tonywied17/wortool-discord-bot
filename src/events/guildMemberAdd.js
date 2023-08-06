/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\events\guildMemberAdd.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Friday August 4th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat August 5th 2023 10:16:19 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

const axios = require('axios');

/**
 * The `guildMemberAdd` event is emitted whenever a user joins a guild.
 * @param {GuildMember} member The member that joined the guild
 * @returns {void}
 */
module.exports = {
  name: 'guildMemberAdd',
  
  /**
   * The `guildMemberAdd` event is emitted whenever a user joins a guild.
   * @param {*} member - The member that joined the guild
   */
  execute(member) {
    const guild = member.guild;
    const guildId = guild.id;
    const memberCount = guild.memberCount;

    console.log(`A member has joined the guild: ${member.user.tag}`);

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
