/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\commands\regimental\setup.js
 * Project: c:\Users\tonyw\AppData\Local\Temp\scp15880\home\bots\ReggieBot\src\commands\regimental
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Tue November 7th 2023 2:43:32 
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
/**
 * The `schedule` command list the upcoming events for the regiment
 */
module.exports = {
    name: "schedule",
    description: "View the upcoming events for today and tomorrow.",
    aliases: ["today", "events", "upcoming"],
    category: "Regimental",
    isAdmin: false,

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

        try {
            const response = await axios.get(`https://api.tonewebdesign.com/pa/regiments/g/${guildId}/discordGuild`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            prefix = response.data.prefix;

        } catch (error) {
            console.error(error);

            const guildConfigPath = path.join(__dirname, '../../../guilds', `${guildId}.json`);
            const guildConfig = JSON.parse(fs.readFileSync(guildConfigPath, 'utf8'));

            prefix = guildConfig.prefix || process.env.DEFAULT_PREFIX;
        }

        try {
            const guildId = message.guild.id;
            const guildAvatar = message.guild.iconURL();
        
            const todayName = new Date().toLocaleString('en-US', {
                weekday: 'long',
            });
        
            const requestData = {
                day: todayName,
            };
        
            const response = await axios.post(`https://api.tonewebdesign.com/pa/regiments/discord/${guildId}/schedules/day/`, requestData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
        
            const data = response.data;
        
            if (data.length === 0) {
                message.channel.send('There are no upcoming events.');
                return;
            }
        
            // Create an object to group events by schedule name
            const eventsBySchedule = {};
            data.forEach(schedule => {
                if (!eventsBySchedule[schedule.schedule_name]) {
                    eventsBySchedule[schedule.schedule_name] = {};
                }
                if (!eventsBySchedule[schedule.schedule_name][schedule.day]) {
                    eventsBySchedule[schedule.schedule_name][schedule.day] = [];
                }
                eventsBySchedule[schedule.schedule_name][schedule.day].push(`${schedule.event_type} - ${convertTo12Hour(schedule.time)}`);
            });
        
            console.log(data.schedule_name);
        
            const embed = { 
                color: 0x425678,
                title: "Upcoming Schedule", 
                description: 'Scheduled events for the upcoming days', 
                thumbnail: { url: guildAvatar }, 
                fields: []
            };
        
            const fields = [];
        
            // Iterate through the schedule names and their corresponding events
            for (const scheduleName in eventsBySchedule) {
                fields.push({ name: scheduleName, value: '' }); // Title for the schedule
                for (const day in eventsBySchedule[scheduleName]) {
                    const events = eventsBySchedule[scheduleName][day].join('\n');
                    fields.push({ name: day, value: events }); // Add events for each day
                }
            }
        
            embed.fields = fields;
        
            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            message.reply("An error occurred.");
        }
        

        function convertTo12Hour(time24) {
            const [hours, minutes] = time24.split(':').map(Number);
            const period = hours >= 12 ? 'PM' : 'AM';
            const hours12 = hours % 12 || 12; 
            const time12 = `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
            return time12;
          }
    }
};
