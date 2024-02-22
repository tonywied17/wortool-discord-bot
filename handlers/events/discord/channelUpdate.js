const { Events } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: Events.ChannelUpdate,
    async execute(oldChannel, newChannel) {
        console.log(`Channel updated in guild: ${newChannel.guild.name}`);
        const bearerToken = process.env.AUTH_SECRET;
        const config = {
            headers: {
                'Authorization': `Bearer ${bearerToken}`
            }
        };

        try {
            const channelChanges = {
                guildId: newChannel.guild.id,
                channelId: newChannel.id,
                oldChannelName: oldChannel.name,
                newChannelName: newChannel.name,
                channelType: newChannel.type
            };

            await axios.post(`https://api.wortool.com/v2/regiments/${newChannel.guild.id}/updateChannel`, channelChanges, config);
            console.log('Channel update sent to endpoint.');
        } catch (error) {
            console.error('Failed to send channel update:', error);
        }
    }
};
