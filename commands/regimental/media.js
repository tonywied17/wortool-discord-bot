const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { waitingForImage } = require('../../shared-state');
require('dotenv').config();

const data = new SlashCommandBuilder()
    .setName('media')
    .setDescription('Follow up with an image attachment to add to your WoRTool media gallery.');

module.exports = {
    isAdmin: false,
    isRoleManager: true,
    data,
    async execute(interaction) {
        waitingForImage[interaction.user.id] = {
            channelId: interaction.channelId,
            timeout: setTimeout(() => {
                delete waitingForImage[interaction.user.id];
                const timeoutEmbed = new EmbedBuilder()
                    .setColor('#FFA500') 
                    .setTitle('Image Upload Timeout')
                    .setDescription('You did not send an image in time. Please try the /media command again if you wish to upload an image.')
                    .setTimestamp();
                interaction.followUp({ embeds: [timeoutEmbed] }).catch(console.error);
            }, 60000)
        };

        const initialReplyEmbed = new EmbedBuilder()
            .setColor('#7e7f74')
            .setTitle('Upload an Image')
            .setDescription('Please upload an image as a follow-up message to add it to your WoRTool media gallery within 60 seconds.')
            .setTimestamp();

        await interaction.reply({ embeds: [initialReplyEmbed] });
    }
};
