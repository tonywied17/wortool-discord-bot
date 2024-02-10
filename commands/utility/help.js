
const {
	SlashCommandBuilder,
	EmbedBuilder
} = require('discord.js');

/**
 * Help Command
 * @type {import('discord.js').SlashCommand}
 * @description Replies with links to the WoR Tools & Features.
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Web links to the WoR Tools & Features.'),
	async execute(interaction) {

await interaction.reply({
content: `## Tools & Features
## [Manage Regiment](<https://wortool.com/mod/1>)\n
Organize your regiment's information, events schedule, media, and member list for optimal coordination.\n
## [Event Share Tool](<https://wortool.com/mod/2>)\n
Easily broadcast your event details within your Discord server to ensure maximum participation.\n
## [Steam Stats Tracker](<https://wortool.com/mod/3>)\n
Monitor and analyze Steam statistics and profiles of your members.\n
## [Company Tool](<https://wortool.com/mod/4>)\n
Track your members' attendance at events and drills, maintaining an active and engaged community.`,
ephemeral: true
		}).catch(console.error);

	},
};