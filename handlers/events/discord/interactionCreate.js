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

        // Check for administrator permissions first
        if (command.isAdmin || command.isRoleManager) {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                // If the command requires administrator permissions or is role-managed and the user is not an admin, deny access.
                if (command.isRoleManager) {
                    // Additional check for role only if it's a role-managed command and user is not an admin
                    let roleManager = interaction.guild.roles.cache.find(role => role.name === "WoRTool Manager");
                    if (roleManager && !interaction.member.roles.cache.has(roleManager.id)) {
                        await interaction.reply({ content: "You do not have the 'WoRTool Manager' role.", ephemeral: true });
                        return;
                    }
                } else {
                    // If it's strictly an admin command and the user is not an admin, inform them.
                    await interaction.reply({ content: "This command requires administrator permissions.", ephemeral: true });
                    return;
                }
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
