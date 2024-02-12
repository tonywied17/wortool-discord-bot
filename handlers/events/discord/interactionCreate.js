const {
    Events,
    PermissionsBitField
} = require('discord.js');

/**
 * Interaction Create Event
 * @type {import('discord.js').Event}
 * @description This event is emitted when a user uses a slash command.
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

        if (command.isAdmin && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({ content: "This command requires administrator permissions.", ephemeral: true });
            return;
        }

        if (command.isRoleManager) {
            let roleManager = interaction.guild.roles.cache.find(role => role.name === "WoRTool Manager");
            if (!interaction.member.roles.cache.has(roleManager.id)) {
                await interaction.reply({ content: "You do not have the 'WoRTool Manager' role.", ephemeral: true });
                return;
            }
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
