/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\events\guildMemberAdd.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Friday August 4th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Thu November 30th 2023 1:46:25 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

const axios = require('axios');
const bearerToken = process.env.AUTH_SECRET
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

    const config = {
      headers: {
        'Authorization': `Bearer ${bearerToken}`
      }
    };

    axios.post(`https://api.tonewebdesign.com/pa/regiments/${guildId}/membercount`, {
      memberCount: memberCount,
    }, config)
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