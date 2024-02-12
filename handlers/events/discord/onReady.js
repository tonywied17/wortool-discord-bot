const { Events, PermissionsBitField } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        // client.guilds.cache.forEach(async (guild) => {
        //     try {
        //         let roleManager = guild.roles.cache.find(role => role.name === "WoRTool Manager");
        //         if (!roleManager) {
        //             await guild.roles.create({
        //                 name: 'WoRTool Manager',
        //                 color: '#1a2330', 
        //                 reason: 'Automatically creating WoRTool Manager role for permissions management'
        //             });
        //             console.log(`Created "WoRTool Manager" role in ${guild.name}`);
        //         }
        //     } catch (error) {
        //         console.error(`Failed to create or check for the "WoRTool Manager" role in ${guild.name}:`, error);
        //     }
        // });
    },
};
