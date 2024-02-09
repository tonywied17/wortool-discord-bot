// media.js
const { SlashCommandBuilder } = require('discord.js');
const { waitingForImage } = require('../../shared-state');
require('dotenv').config();

const data = new SlashCommandBuilder()
    .setName('media')
    .setDescription('Follow up with an image attachment to add to your WoRTool media gallery.');

module.exports = {
    data,
    async execute(interaction) {
        waitingForImage[interaction.user.id] = {
            channelId: interaction.channelId,
            timeout: setTimeout(() => {
                delete waitingForImage[interaction.user.id];
                interaction.followUp('You did not send an image in time. Please try the /media command again if you wish to upload an image.').catch(console.error);
            }, 60000) // 60 seconds timeout
        };
        await interaction.reply('Please upload an image as a follow-up message to add it to your WoRTool media gallery within 60 seconds.');
    }
};
