const { Events } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: Events.GuildRoleCreate,
    async execute(role) {
        console.log(`New role created: ${role.name} in guild ${role.guild.name}`);

        const webhookSecret = process.env.WEBHOOK_SECRET;
        const config = {
          headers: {
            'x-webhook-secret': webhookSecret
          }
        };
    
        try {
            await axios.post(`https://api.wortool.com/v2/regiments/${role.guild.id}/newRole`,  {
                guildId: role.guild.id,
                roleId: role.id,
                roleName: role.name
            }, config);
            console.log('New role sent to endpoint.');
        } catch (error) {
            console.error('Failed to send new role:', error);
        }
    }
};
