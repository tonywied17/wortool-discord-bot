/*
 * File: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot\src\commands\regimental\setup.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Monday June 26th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Wed November 29th 2023 3:38:33 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config()
const fs = require('fs');
const path = require("path");
const bearerToken = process.env.AUTH_SECRET;
const currentDate = new Date();
const today = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;

module.exports = {
    name: "enlist",
    description: "Enlist User's into your Regiment's Roster",
    category: "Regimental",
    isAdmin: true,
    data: new SlashCommandBuilder()
        .setName('enlist')
        .setDescription('Enlist User\'s into your Regiment\'s Roster')
        .addSubcommand(subcommand =>
            subcommand
                .setName('role')
                .setDescription('Mass enlist user\'s by a selected role.')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('Select a Discord Role')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('users')
                .setDescription('Manually select users for enlistment.')
                .addUserOption(option =>
                    option
                        .setName('target')
                        .setDescription('Select users.')
                        .setRequired(true)
                )
        ),


    async execute(message, args, guildPrefix, client, interaction) {
        const guildId = (interaction ? interaction.guild.id : message.guild.id);

        const selectedRoles = interaction.options.getRole('role');
        const selectedUsers = [interaction.options.getUser('target')];

        // console.log('Selected Roles:', selectedRoles);
        console.log('Selected Users:', selectedUsers);


        const guildAvatar = (interaction ? interaction.guild.iconURL() : message.guild.iconURL());
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
            prefix = process.env.DEFAULT_PREFIX;
        }


        if (interaction) {

            if (interaction.options.getSubcommand() === 'role') {
                try {
                    const config = {
                        headers: {
                            'Authorization': `Bearer ${bearerToken}`,
                        }
                    };

                    const role = interaction.guild.roles.cache.find(r => r.name === selectedRoles.name);
                    await interaction.guild.members.fetch();

                    const membersWithRole = role.members.map(member => ({
                        id: member.user.id,
                        username: member.user.username,
                        nickname: member.nickname,
                    }));

                    console.log(Array.from(membersWithRole));



                    const usersData = membersWithRole.map(member => ({
                        nickname: member.nickname ? member.nickname : member.username,
                        discordId: member.id,
                        regimentId: regimentId,
                        events: 0,
                        drills: 0,
                        join_date: today,
                        last_muster: today,
                    }));

                    const embed = new EmbedBuilder()
                        .setColor("#425678")
                        .setTitle(`Roster Enlistment`)
                        .setThumbnail(guildAvatar)
                    usersData.forEach((userData, index) => {
                        const userMention = `<@${userData.discordId}>`;
                        embed.addFields({
                            name: `#${index + 1} ${userData.nickname}`,
                            value: `> ${userMention}\n> **Enlisted On** ${userData.join_date}`,
                        });
                    });
                    embed.setTimestamp();

                    interaction.reply({ embeds: [embed] }).then(() => {
                        axios.post('https://api.tonewebdesign.com/pa/musteruser/create', usersData, config)
                            .then(response => {
                                console.log(response.data);
                                interaction.followUp(`## Success!\n> You may now muster the enlisted user's by using \`/muster\`\n> If user's were already enlisted no stats or dates will be affected, only new users will be enlisted.`)
                            })
                            .catch(error => {
                                console.error(error);
                                interaction.followUp('❌ An error occurred');
                            });
                    });
                } catch (err) {
                    interaction.reply(`## Uh-Oh!\n> This role has more then \`25 user's\` which is the discord bot payload limit.\n> To mass enlist a higher populated role please use the [WoRTool App Enlister](https://wortool.com/mod/4)`)
                    console.error(err)
                }
            } else if (interaction.options.getSubcommand() === 'users') {
                try {

                    const usersData = selectedUsers.map(user => ({
                        nickname: user.nickname ? user.nickname : user.username,
                        discordId: user.id,
                        regimentId: regimentId,
                        events: 0,
                        drills: 0,
                        join_date: today,
                        last_muster: today,
                    }));

                    // Post the array of user data to create enlistments
                    const config = {
                        headers: {
                            'Authorization': `Bearer ${bearerToken}`,
                        }
                    };

                    const embed = new EmbedBuilder()
                        .setColor("#425678")
                        .setTitle(`Roster Enlistment`)
                        .setThumbnail(guildAvatar)
                    usersData.forEach((userData, index) => {
                        const userMention = `<@${userData.discordId}>`;
                        embed.addFields({
                            name: `#${index + 1} ${userData.nickname}`,
                            value: `> ${userMention}\n> **Enlisted On** ${userData.join_date}`,
                        });
                    });
                    embed.setTimestamp();

                    interaction.reply({ embeds: [embed] }).then(() => {
                        axios.post('https://api.tonewebdesign.com/pa/musteruser/create', usersData, config)
                            .then(response => {
                                console.log(response.message);
                                interaction.followUp(`## Success!\n> You may now muster the enlisted user's by using \`/muster\`\n> If user's were already enlisted no stats or dates will be affected, only new users will be enlisted.`)
                            })
                            .catch(error => {
                                console.error(error);
                                interaction.followUp('❌ An error occurred');
                            });
                    });
                } catch (err) {
                    console.error(err);
                }
            } else {
                interaction.reply(`No Subcommand`)
            }

        }

    }


};
