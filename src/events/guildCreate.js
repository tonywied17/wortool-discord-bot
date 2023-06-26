const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

module.exports = {
  name: 'guildCreate',
  execute(guild) {
    const guildConfigPath = path.join(__dirname, '../../guilds', `${guild.id}.json`);

    if (!fs.existsSync(guildConfigPath)) {
      const guildConfig = {
        prefix: config.defaultPrefix,
        // Add other guild-specific properties here
      };

      fs.writeFileSync(guildConfigPath, JSON.stringify(guildConfig, null, 2));
    }
  },
};
