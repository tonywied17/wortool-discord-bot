const { Events } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: Events.ChannelDelete,
    async execute(channel) {
        console.log(`Channel deleted: ${channel.name} in guild ${channel.guild.name}`);

        const webhookSecret = process.env.WEBHOOK_SECRET;
        const config = {
            headers: {
                'x-webhook-secret': webhookSecret
            }
        };

        try {
            await axios.post(`https://api.wortool.com/v2/regiments/${channel.guild.id}/deleteChannel`, {
                guildId: channel.guild.id,
                channelId: channel.id,
            }, config);
            console.log('Channel deletion sent to endpoint.');
        } catch (error) {
            console.error('Failed to notify about channel deletion:', error);
        }
    }
};
