/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\commands\regimental\setup.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat November 25th 2023 10:46:07 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config()
const fs = require('fs');
const path = require("path");

const data = new SlashCommandBuilder()
  .setName('schedule')
  .setDescription('View the upcoming events for today and tomorrow.');

module.exports = {
    name: "schedule",
    description: "View the upcoming events for today and tomorrow.",
    aliases: ["today", "events", "upcoming"],
    category: "Regimental",
    isAdmin: false,
    data,
    async execute(message, args, guildPrefix, client, interaction) {
        const guildId = (interaction ? interaction.guild.id : message.guild.id);
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
            prefix = process.env.DEFAULT_PREFIX;
        }

        try {

            const guildId = (interaction ? interaction.guild.id : message.guild.id);
            const guildAvatar = (interaction ? interaction.guild.iconURL() : message.guild.iconURL());
        
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
                (interaction ? interaction.reply('There are no upcoming events.') : message.channel.send('There are no upcoming events.'));
                return;
            }
        

            const eventsBySchedule = {};
            data.forEach(schedule => {
                if (!eventsBySchedule[schedule.schedule_name]) {
                    eventsBySchedule[schedule.schedule_name] = {};
                }
                if (!eventsBySchedule[schedule.schedule_name][schedule.day]) {
                    eventsBySchedule[schedule.schedule_name][schedule.day] = [];
                }
                eventsBySchedule[schedule.schedule_name][schedule.day].push(`${schedule.event_type} @ ${convertToShortTime(schedule.time)}`);
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
        

            for (const scheduleName in eventsBySchedule) {
                fields.push({ name: scheduleName, value: '' }); 
                for (const day in eventsBySchedule[scheduleName]) {
                    const events = eventsBySchedule[scheduleName][day].join('\n');
                    fields.push({ name: day, value: events });
                }
            }
        
            embed.fields = fields;

            if (interaction) {
                interaction.reply({ embeds: [embed] });
            } else {
                message.channel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error(error);
            (interaction ? interaction.reply("An error occurred.") : message.reply("An error occurred."));
        }
        

        function convertTo12Hour(time24) {
            const [hours, minutes] = time24.split(':').map(Number);
            const now = new Date();
            const timestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes).getTime() / 1000);
            return timestamp;
        }


        function convertToShortTime(time24) {
            const timestamp = convertTo12Hour(time24);
            return `<t:${timestamp}:t>`;
        }

        
    }
};