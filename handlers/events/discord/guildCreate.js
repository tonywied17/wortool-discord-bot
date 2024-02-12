const { Events } = require('discord.js');

module.exports = {
  name: Events.GuildCreate,
  async execute(guild) {
    console.log(`Joined a new guild: ${guild.name} (id: ${guild.id})`);

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
  }
};
