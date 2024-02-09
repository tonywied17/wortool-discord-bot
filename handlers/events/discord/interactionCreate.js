/*
 * File: c:\Users\tonyw\Desktop\git-222-bot\222-discord-bot\handlers\events\discord\interactionCreate.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Saturday February 3rd 2024
 * Author: Tony Wiedman
 * -----
 * Last Modified: Fri February 9th 2024 10:28:24 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2024 MolexWorks / Tone Web Design
 */

const {
	Events
} = require('discord.js');

/**
 * Interaction Create Event
 * @type {import('discord.js').Event}
 * @description This event is emitted when a user uses a slash command.
 * Each command use has a 22% chance to send a waifu pic.
 * @param {import('discord.js').CommandInteraction} interaction
 * @returns {Promise<void>}
 */
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;
		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}
		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: 'There was an error while executing this command!',
					ephemeral: true
				});
			} else {
				await interaction.reply({
					content: 'There was an error while executing this command!',
					ephemeral: true
				});
			}
		}
	},

};
