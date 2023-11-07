/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\commands\regimental\setup.js
 * Project: c:\Users\tonyw\AppData\Local\Temp\scp42087\home\bots\ReggieBot\src\commands\regimental
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Tue November 7th 2023 2:52:30 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config()
// require("dotenv").config({ path: "/home/tonewebdesign/envs/pa/.env" });
const fs = require('fs');
const path = require("path");
const download = require('image-downloader');

/**
 * The `schedule` command list the upcoming events for the regiment
 */
module.exports = {
    name: "media",
    description: "Add Discord image attachments to your WoRTool media gallery",
    aliases: ["gallery", "g", "pics"],
    category: "Regimental",
    isAdmin: true,

    /**
     * @param {*} message - The message
     * @param {*} args - The arguments
     * @param {*} guildPrefix - The guild prefix
     * @param {*} client - The client
     * @returns - {void}
     */
    async execute(message, args, guildPrefix, client) {
        const guildId = message.guild.id;
        let prefix = '';
        let regimentId = '';

        try {
            const response = await axios.get(`https://api.tonewebdesign.com/pa/regiments/g/${guildId}/discordGuild`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            prefix = response.data.prefix;
            regimentId = response.data.regimentId;

        } catch (error) {
            console.error(error);

            const guildConfigPath = path.join(__dirname, '../../../guilds', `${guildId}.json`);
            const guildConfig = JSON.parse(fs.readFileSync(guildConfigPath, 'utf8'));

            prefix = guildConfig.prefix || process.env.DEFAULT_PREFIX;
        }

        try {
            const attachment = message.attachments.first();
            const guildId = message.guild.id;
            
            if (!attachment) {
                message.reply(`Please upload an image with this command as the comment. See **.gallery help** for more information`);
                return;
            }

            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml'];
            if (!allowedMimeTypes.includes(attachment.contentType)) {
                message.reply('Please upload a valid image with this command as the comment.');
            return;
    }
        
            let random = `gallery-item-${makeId(5)}.jpg`
            let localUrl = `https://api.tonewebdesign.com/pa/regiments/${regimentId}/files/${random}`
            let filePath = `/home/tonewebdesign/public_html/api.tonewebdesign.com/pa-api/resources/${regimentId}/static/assets/uploads/${random}`
            

            const options = {
                url: attachment.url,
                dest: filePath, 
            };

            download.image(options)
                    .then(({ filename }) => {
                        console.log('Saved to', filename);
                    })
                    .catch((err) => console.error(err));

            message.react('🖼️')

            
        } catch (error) {
            console.error(error);
            message.reply("An error occurred.");
        }
        
        function makeId(length) {
            var result           = '';
            var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for ( var i = 0; i < length; i++ ) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }
    }


};
