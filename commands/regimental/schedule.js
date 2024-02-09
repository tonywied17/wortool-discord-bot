/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\commands\regimental\setup.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Fri February 9th 2024 10:21:51 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config()

const data = new SlashCommandBuilder()
  .setName('schedule')
  .setDescription('View the upcoming events for today and tomorrow.');

module.exports = {
    data,
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const guildAvatar = interaction.guild.iconURL();
        let prefix = '';

        try {
            const response = await axios.get(`https://api.wortool.com/v2/regiments/g/${guildId}/discordGuild`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            prefix = response.data.prefix;
        } catch (error) {
            console.error(error);
            prefix = process.env.DEFAULT_PREFIX;
        }

        try {
            const todayName = new Date().toLocaleString('en-US', { weekday: 'long' });
            const requestData = { day: todayName };
            const response = await axios.post(`https://api.wortool.com/v2/regiments/discord/${guildId}/schedules/day/`, requestData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            const data = response.data;
            if (data.length === 0) {
                interaction.reply('There are no upcoming events.');
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

            const embed = new EmbedBuilder()
                .setColor(0x425678)
                .setTitle("Upcoming Schedule")
                .setDescription('Scheduled events for the upcoming days')
                .setThumbnail(guildAvatar)
                .addFields(
                    Object.entries(eventsBySchedule).flatMap(([scheduleName, days]) =>
                        Object.entries(days).map(([day, events]) => ({ name: day, value: events.join('\n') }))
                    )
                );

            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            interaction.reply("An error occurred.");
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
