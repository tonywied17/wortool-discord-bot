/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\events\onReady.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Thu November 30th 2023 1:44:52 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
module.exports = {
    name: "ready",
    once: true,

    /**
     * The `ready` event is emitted when the client becomes ready to start working.
     * @param {*} client - The client
     */
    execute(client) {
      console.log(`Bot is ready as ${client.user.tag}`);
    }
  };
  