const { Events } = require('discord.js');
const axios = require('axios');
const bearerToken = process.env.AUTH_SECRET
module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        console.log(`Joined a new guild: ${guild.name} (id: ${guild.id})`);

        // Check and create a specific role if it doesn't exist
        let roleManager = guild.roles.cache.find(role => role.name === "WoRTool Manager");
        if (!roleManager) {
            try {
                roleManager = await guild.roles.create({
                    name: 'WoRTool Manager',
                    color: '#1a2330',
                });
                console.log(`Created "WoRTool Manager" role in guild: ${guild.name}`);
            } catch (error) {
                console.error(`Failed to create "WoRTool Manager" role in guild: ${guild.name}`, error);
            }
        }

        try {
            const roles = await guild.roles.fetch();
            console.log(`Roles in ${guild.name}:`);
            roles.cache.forEach(role => console.log(role.name));
            
            const config = {
              headers: {
                'Authorization': `Bearer ${bearerToken}`
              }
            };
            await axios.post(`https://api.wortool.com/v2/regiments/${role.guild.id}/newRoles`, {
                guildId: guild.id,
                roles: roles.cache.map(role => ({ id: role.id, name: role.name }))
            },config);
            console.log('Roles sent to endpoint.');
        } catch (error) {
            console.error('Failed to send roles:', error);
        }
    }
};