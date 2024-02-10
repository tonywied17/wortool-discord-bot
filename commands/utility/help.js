const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Lists all available commands sorted by category and provides useful web links.'),
    async execute(interaction) {
        const commandsPath = '/home/bots/ReggieBot/commands';
		console.log(commandsPath)
        const categories = fs.readdirSync(commandsPath).filter(file => fs.statSync(path.join(commandsPath, file)).isDirectory());

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Available Commands')
            .setDescription('Here are the commands sorted by category:');

        for (const category of categories) {
            const categoryCommandsPath = path.join(commandsPath, category);
            const commandFiles = fs.readdirSync(categoryCommandsPath).filter(file => file.endsWith('.js'));

            let commandList = '';

            for (const file of commandFiles) {
                const filePath = path.join(categoryCommandsPath, file);
                const command = require(filePath);
                if (command.data.name) {
                    commandList += `\`/${command.data.name}\`   ${command.data.description || 'No description available'}\n`;
                }
            }

            if (commandList.length > 0) {
                embed.addFields({ name: category.charAt(0).toUpperCase() + category.slice(1), value: commandList });
            }
        }

        const webLinksRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Manage Regiment')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://wortool.com/mod/1'),
                new ButtonBuilder()
                    .setLabel('Event Share Tool')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://wortool.com/mod/2'),
                new ButtonBuilder()
                    .setLabel('Steam Stats Tracker')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://wortool.com/mod/3'),
                new ButtonBuilder()
                    .setLabel('Company Muster Tool')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://wortool.com/mod/4')
            );



			await interaction.reply({
				embeds: [embed],
				ephemeral: true
			}).catch(console.error);

			const member = interaction.guild.members.cache.get(interaction.user.id);
			if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				await interaction.followUp({
					content: `**WorTool Quick Links for Admins**\n`,
					components: [webLinksRow],
					ephemeral: true
				}).catch(console.error);
        	return;
      		}
			
			
    },
};
