const { Events, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { waitingForImage } = require('../../../shared-state');
const axios = require('axios');
const download = require('image-downloader');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    const guildId = message.guild?.id;

    if (!guildId) {
      return;
    }

    const userState = waitingForImage[message.author.id];
    if (!message.author.bot && message.attachments.size > 0 && userState && userState.channelId === message.channelId) {
      const member = message.guild.members.cache.get(message.author.id);
      
      const hasAdminPermissions = member.permissions.has(PermissionsBitField.Flags.Administrator);
      const hasWorToolManagerRole = member.roles.cache.some(role => role.name === "WoRTool Manager");

      if (!(hasAdminPermissions || hasWorToolManagerRole)) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000') 
          .setTitle('Permission Denied')
          .setDescription("You need admin permissions or the 'WoRTool Manager' role to upload images.");
        message.reply({ embeds: [embed] });
        return;
      }

      const attachment = message.attachments.first();
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml'];

      if (allowedMimeTypes.includes(attachment.contentType)) {
        clearTimeout(userState.timeout);
        delete waitingForImage[message.author.id];

        try {
          const regimentsResponse = await axios.get(`https://api.wortool.com/v2/regiments/g/${guildId}/discordGuild`);
          const regimentId = regimentsResponse.data.regimentId;

          let randomFilename = `gallery-item-${makeId(5)}.jpg`;
          let url = `[${message.guild.name}](<https://wortool.com/regiments/${regimentId}/>)`;
          let filePath = `/home/paarmy/public_html/api.wortool.com/wor-api/resources/${regimentId}/static/assets/uploads/${randomFilename}`;

          await download.image({ url: attachment.url, dest: filePath });
          console.log('Saved to', filePath);
          message.react('🖼️');

          const successEmbed = new EmbedBuilder()
            .setColor('#00FF00') 
            .setTitle('Media Uploaded Successfully')
            .setDescription(`Media has been added to ${url} WoRTool Page.`);

          message.reply({ embeds: [successEmbed] });
        } catch (error) {
          console.error(error);
          const errorEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Failed to Upload Image')
            .setDescription('Failed to download or save the image.');
          message.reply({ embeds: [errorEmbed] });
        }
      } else {
        const invalidImageEmbed = new EmbedBuilder()
          .setColor('#FFA500')
          .setTitle('Invalid Image Format')
          .setDescription('Please upload a valid image.');
        message.reply({ embeds: [invalidImageEmbed] });
      }
    } else if (userState && userState.channelId === message.channelId) {
      const promptEmbed = new EmbedBuilder()
        .setColor('#FFFF00') 
        .setTitle('Image Required')
        .setDescription('Please upload an image. Text messages are not processed for the /media command.');
      message.reply({ embeds: [promptEmbed] });
    }
  },
};

function makeId(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
