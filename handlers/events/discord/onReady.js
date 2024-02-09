
const {
	Events
} = require('discord.js');

/**
 * Client Ready Event
 * @type {import('discord.js').Event}
 */
module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};