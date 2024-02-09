
const {
	SlashCommandBuilder,
	EmbedBuilder
} = require('discord.js');

/**
 * Ping Command
 * @type {import('discord.js').SlashCommand}
 * @description Replies with Pong!
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		const startTime = Date.now();
		const botLatency = Date.now() - interaction.createdTimestamp;
		const apiLatency = interaction.client.ws.ping;
		const guildAvatar = interaction.guild.iconURL({
			dynamic: true
		});

		// Embed that uses the EmbedBuilder class
		const embed1 = new EmbedBuilder()
			.setColor("#425678")
			.setTitle(`Pong!`)
			.setThumbnail(guildAvatar)
			.addFields({
				name: `Bot Latency`,
				value: `${botLatency} ms`
			}, {
				name: `API Latency`,
				value: `${apiLatency} ms`
			})
			.setTimestamp(new Date())
			.setFooter({
				text: `Roundtrip Time: ${Date.now() - startTime}ms`
			})

		await interaction.reply({
			embeds: [embed1]
		});

	},
};