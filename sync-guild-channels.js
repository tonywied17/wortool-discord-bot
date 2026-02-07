const { REST, Routes } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const webhookSecret = process.env.WEBHOOK_SECRET;

const rest = new REST({ version: '10' }).setToken(token);

const syncGuildChannels = async () => {
    try {
        console.log('Fetching regiment guild IDs...');
        const regimentsResponse = await axios.get('https://api.wortool.com/v2/regiments/');
        const guildIds = regimentsResponse.data.map(regiment => regiment.guild_id);

        for (const guildId of guildIds) {
            try {
                console.log(`Fetching channels for guild ID: ${guildId}...`);
                const channels = await rest.get(Routes.guildChannels(guildId));

                const channelsData = channels.map(channel => ({
                    id: channel.id,
                    name: channel.name,
                    type: channel.type, 
                }));

                console.log(`Syncing channels to backend for guild ID: ${guildId}...`);

                const config = {
                    headers: {
                        'x-webhook-secret': webhookSecret
                    }
                };

                await axios.post(`https://api.wortool.com/v2/regiments/${guildId}/newChannels`, {
                    guildId: guildId,
                    channels: channelsData
                }, config);

                console.log(`Successfully synced channels for guild ID: ${guildId}.`);
            } catch (error) {
                console.error(`Failed to fetch channels or sync to backend for guild ID: ${guildId}. Error:`, error);
            }
        }
    } catch (error) {
        console.error('Failed to fetch regiment guild IDs or sync channels. Error:', error);
    }
};

(async () => {
    await syncGuildChannels();
})();
