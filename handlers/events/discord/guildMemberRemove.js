/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\events\guildMemberRemove.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Friday August 4th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Fri February 9th 2024 10:31:38 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
const { Events } = require('discord.js');
const axios = require('axios');
const webhookSecret = process.env.WEBHOOK_SECRET
/**
 * The `guildMemberRemove` event is emitted whenever a member leaves a guild, or is kicked.
 * @param {GuildMember} member The member that left the guild
 * @returns {void}
 */
module.exports = {
  name: Events.GuildMemberRemove,
  /**
   * The `guildMemberRemove` event is emitted whenever a member leaves a guild, or is kicked.
   * @param {*} member - The member that left the guild
   * @returns {void}
   */
  async execute(member) {
    const guild = member.guild;
    const guildId = guild.id;
    const memberCount = guild.memberCount;

    console.log(`A member has left the guild: ${member.user.tag}`);
    
    const config = {
      headers: {
        'x-webhook-secret': webhookSecret
      }
    };

    axios.post(`https://api.wortool.com/v2/regiments/${guildId}/membercount`, {
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