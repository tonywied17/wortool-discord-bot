const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
    isAdmin: true,
    isRoleManager: false,
    data: new SlashCommandBuilder()
        .setName('adminhelp')
        .setDescription('Provides vital information on admin functions and regimental management.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#7e7f74')
            .setTitle('NCO Bot: Admin and Management Commands Guide')
            .setDescription('A comprehensive guide to utilizing admin functions and managing your regiment effectively.')
            .addFields(
                { name: '🔧 Management Commands Access', value: 'To grant your staff and NCOs access to management commands such as `/muster`, `/enlist`, `/media`, assign them the `WoRTool Manager` role. Alternatively, use the `/promote` command for role assignment.' },
                { name: '🌐 WorTool.com Integration', value: 'For additional features, have members sign up at wortool.com and join your regiment. While Discord members can be enlisted into the company roster without a wortool.com account, NCOs must register to access web-based management tools.' },
                { name: '👥 Promoting Regiment Managers', value: 'After registration, promote members to managers on wortool.com using the `/promote` command to grant them access to both slash commands and web-based Regimental Tools & Features.' }
            )
            .setFooter({ text: 'For further assistance, contact support.' });

            const webLinksRow = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setLabel('Manage Regiment')
              .setStyle(ButtonStyle.Link)
              .setURL('https://wortool.com/mod/1'),
          );

        await interaction.reply({
            embeds: [embed],
            components: [webLinksRow],
            ephemeral: true
        }).catch(console.error);
    },
};
