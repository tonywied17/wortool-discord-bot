/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\events\onReady.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat August 5th 2023 3:48:17 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */


/**
 * Bot ready event
 */
module.exports = {
    name: "ready",
    once: true,
    /**
     * @param {*} client - The Discord client
     */
    execute(client) {
      console.log(`Bot is ready as ${client.user.tag}`);
    }
  };
  