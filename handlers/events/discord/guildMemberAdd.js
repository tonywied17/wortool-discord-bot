/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\events\guildMemberAdd.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Friday August 4th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Fri February 9th 2024 10:31:46 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
const { Events } = require('discord.js');
const axios = require('axios');
const webhookSecret = process.env.WEBHOOK_SECRET;
/**
 * The `guildMemberAdd` event is emitted whenever a user joins a guild.
 * @param {GuildMember} member The member that joined the guild
 * @returns {void}
 */
module.exports = {
  name: Events.GuildMemberAdd,
  /**
   * The `guildMemberAdd` event is emitted whenever a user joins a guild.
   * @param {*} member - The member that joined the guild
   */
  async execute(member) {
    const guild = member.guild;
    const guildId = guild.id;
    const memberCount = guild.memberCount;

    console.log(`A member has joined the guild: ${member.user.tag}`);

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