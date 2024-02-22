const { Events } = require('discord.js');
const axios = require('axios');
module.exports = {
    name: Events.GuildRoleDelete,
    async execute(role) {
        console.log(`Role deleted: ${role.name} in guild ${role.guild.name}`);
        const bearerToken = process.env.AUTH_SECRET
        const config = {
          headers: {
            'Authorization': `Bearer ${bearerToken}`
          }
        };
        try {
            await axios.post(`https://api.wortool.com/v2/regiments/${role.guild.id}/deleteRole`, {
                guildId: role.guild.id,
                roleId: role.id,
            },config);
            console.log('Role deletion sent to endpoint.');
        } catch (error) {
            console.error('Failed to notify about role deletion:', error);
        }
    }
};
