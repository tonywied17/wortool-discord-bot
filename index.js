const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { loadCommands } = require('./src/handlers/commandHandler');
const guildCreate = require('./src/events/guildCreate');
const messageCreate = require('./src/events/messageCreate');

const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

// Load commands
loadCommands(client, './src/commands');

client.on('guildCreate', guild => {
  guildCreate.execute(guild);
});

client.on('messageCreate', message => {
  const guildId = message.guild?.id;
  if (!guildId) return;

  const guildConfigPath = path.join(__dirname, 'guilds', `${guildId}.json`);
  let guildPrefix = config.defaultPrefix; // Default prefix

  // Check if the guild-specific configuration file exists
  if (fs.existsSync(guildConfigPath)) {
    try {
      const guildConfig = JSON.parse(fs.readFileSync(guildConfigPath, 'utf8'));
      guildPrefix = guildConfig.prefix || config.defaultPrefix; // Use the guild-specific prefix if available
    } catch (error) {
      console.error(`Error parsing guild config file for guild ${guildId}:`, error);
    }
  }

  messageCreate.execute(client, guildPrefix, message); // Pass the guild-specific prefix
});

client.login(config.token);
