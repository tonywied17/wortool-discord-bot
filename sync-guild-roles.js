const { REST, Routes } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const token = process.env.TOKEN;
const bearerToken = process.env.AUTH_SECRET;

const rest = new REST({ version: '10' }).setToken(token);

const syncGuildRoles = async () => {
    try {
        console.log('Fetching regiment guild IDs...');
        const regimentsResponse = await axios.get('https://api.wortool.com/v2/regiments/');
        const guildIds = regimentsResponse.data.map(regiment => regiment.guild_id);

        for (const guildId of guildIds) {
            try {
                console.log(`Fetching roles for guild ID: ${guildId}...`);
                const roles = await rest.get(Routes.guildRoles(guildId));

                const rolesData = roles.map(role => ({
                    id: role.id,
                    name: role.name,
                }));

                console.log(`Syncing roles to backend for guild ID: ${guildId}...`);

                const config = {
                    headers: {
                        'Authorization': `Bearer ${bearerToken}`
                    }
                };

                await axios.post(`https://api.wortool.com/v2/regiments/${guildId}/newRoles`, {
                    guildId: guildId,
                    roles: rolesData
                }, config);

                console.log(`Successfully synced roles for guild ID: ${guildId}.`);
            } catch (error) {
                console.error(`Failed to fetch roles or sync to backend for guild ID: ${guildId}. Error:`, error);
            }
        }
    } catch (error) {
        console.error('Failed to fetch regiment guild IDs or sync roles. Error:', error);
    }
};

(async () => {
    await syncGuildRoles();
})();
