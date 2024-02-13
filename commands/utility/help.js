const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
    isAdmin: false,
    isRoleManager: false,
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Lists all available commands sorted by category and provides useful web links.'),
    async execute(interaction) {
        const commandsPath = path.join(__dirname, '../../commands');
        console.log(commandsPath);
        const categories = fs.readdirSync(commandsPath).filter(file => fs.statSync(path.join(commandsPath, file)).isDirectory());

        const embed = new EmbedBuilder()
            .setColor("#425678")
            .setTitle('Available Commands')
            .setDescription('Here are the commands sorted by category:');

        const member = interaction.guild.members.cache.get(interaction.user.id);
        const hasAdminPermissions = member.permissions.has(PermissionsBitField.Flags.Administrator);
        const hasWorToolManagerRole = member.roles.cache.some(role => role.name === "WoRTool Manager");

        for (const category of categories) {
            const categoryCommandsPath = path.join(commandsPath, category);
            const commandFiles = fs.readdirSync(categoryCommandsPath).filter(file => file.endsWith('.js'));

            let commandList = '';

            for (const file of commandFiles) {
                const filePath = path.join(categoryCommandsPath, file);
                const command = require(filePath);

                const displayCommand = hasAdminPermissions || 
                    (command.isRoleManager && hasWorToolManagerRole) || 
                    (!command.isAdmin && !command.isRoleManager); 

                if (command.data.name && displayCommand) {
                    const commandDescription = `\`/${command.data.name}\` ${command.data.description || 'No description available'}`;
                    commandList += `${commandDescription}\n`;
                }
            }

            if (commandList.length > 0) {
                embed.addFields({ name: category.charAt(0).toUpperCase() + category.slice(1), value: commandList.trim() });
            }
        }

        embed.setFooter({ text: 'Commands available to you based on your permissions and roles are listed.' });

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        }).catch(console.error);

        if (hasAdminPermissions || hasWorToolManagerRole) {
            const webLinksRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setLabel('Manage Regiment').setStyle(ButtonStyle.Link).setURL('https://wortool.com/mod/1'),
                    new ButtonBuilder().setLabel('Event Share Tool').setStyle(ButtonStyle.Link).setURL('https://wortool.com/mod/2'),
                    new ButtonBuilder().setLabel('Steam Stats Tracker').setStyle(ButtonStyle.Link).setURL('https://wortool.com/mod/3'),
                    new ButtonBuilder().setLabel('Company Muster Tool').setStyle(ButtonStyle.Link).setURL('https://wortool.com/mod/4')
                );

            await interaction.followUp({
                content: `## NCO Bot Commands
- To allow your staff and NCO's access to the management slash commands (/muster, /enlist, /media) assign them the \`WoRTool Manager\` role that was automatically created, or use command \`/promote\`.
## WorTool.com Web-Based Features
- You can have additional members sign up on wortool.com and join your regiment from their linked accounts section. *Discord members do not need to be registered on wortool.com to be enlisted to the company muster tool. However, your NCO's will need to be registered to access the web-based tools below.*
- Once members are registered and join your regiment on wortool.com you may promote them to managers by using the \`/promote\` slash command. \n*This will allow them access to management slash commands as well as the same Regimental Tools & Features you see below.*`,
                components: [webLinksRow],
                ephemeral: true
            }).catch(console.error);
        }
    },
};
