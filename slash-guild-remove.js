const { REST, Routes } = require('discord.js');
const axios = require('axios');
const path = require('node:path');
require('dotenv').config();
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;

const rest = new REST({ version: '10' }).setToken(token);

const fetchAndDeleteGuildCommands = async () => {
    try {
        console.log('Fetching regiment guild IDs...');
        const regimentsResponse = await axios.get('https://api.wortool.com/v2/regiments/');
        const guildIds = regimentsResponse.data.map(regiment => regiment.guild_id);

        for (const guildId of guildIds) {
            try {
                console.log(`Fetching existing commands for guild ID: ${guildId}...`);
                const existingCommands = await rest.get(Routes.applicationGuildCommands(clientId, guildId));

                console.log(`Deleting existing commands for guild ID: ${guildId}...`);
                for (const command of existingCommands) {
                    await rest.delete(Routes.applicationGuildCommand(clientId, guildId, command.id));
                }
                console.log(`Successfully deleted all commands for guild ID: ${guildId}.`);
            } catch (error) {
                console.error(`Failed to delete commands for guild ID: ${guildId}. Error:`, error);
            }
        }
    } catch (error) {
        console.error('Failed to fetch regiment guild IDs or delete commands. Error:', error);
    }
};

(async () => {
    await fetchAndDeleteGuildCommands();
})();
