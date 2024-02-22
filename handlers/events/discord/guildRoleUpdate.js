const { Events } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: Events.GuildRoleUpdate,
    async execute(oldRole, newRole) {
        console.log(`Role updated in guild: ${newRole.guild.name}`);
        const bearerToken = process.env.AUTH_SECRET;
        const config = {
            headers: {
                'Authorization': `Bearer ${bearerToken}`
            }
        };

        try {
            const roleChanges = {
                guildId: newRole.guild.id,
                roleId: newRole.id,
                oldRoleName: oldRole.name,
                newRoleName: newRole.name,
            };

            await axios.post(`https://api.wortool.com/v2/regiments/${newRole.guild.id}/updateRole`, roleChanges, config);
            console.log('Role update sent to endpoint.');
        } catch (error) {
            console.error('Failed to send role update:', error);
        }
    }
};
