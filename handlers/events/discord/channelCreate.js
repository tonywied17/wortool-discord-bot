const { Events } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: Events.ChannelCreate,
    async execute(channel) {
        console.log(`New channel created: ${channel.name} in guild ${channel.guild.name}`);

        const bearerToken = process.env.AUTH_SECRET;
        const config = {
            headers: {
                'Authorization': `Bearer ${bearerToken}`
            }
        };

        try {
            await axios.post(`https://api.wortool.com/v2/regiments/${channel.guild.id}/newChannel`, {
                guildId: channel.guild.id,
                channelId: channel.id,
                channelName: channel.name,
                channelType: channel.type
            }, config);
            console.log('New channel sent to endpoint.');
        } catch (error) {
            console.error('Failed to send new channel:', error);
        }
    }
};
