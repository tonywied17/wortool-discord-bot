const { Events, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { waitingForImage } = require('../../../shared-state');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { finished } = require('stream/promises');

async function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function fetchRegimentId(guildId)
{
    const url = `https://api.wortool.com/v2/regiments/g/${guildId}/discordGuild`;
    const maxAttempts = 3;
    const delays = [500, 1000, 2000];

    for (let attempt = 1; attempt <= maxAttempts; attempt++)
    {
        try
        {
            const resp = await axios.get(url, { timeout: 5000 });
            if (resp && resp.data && resp.data.regimentId)
            {
                return resp.data.regimentId;
            }
            // If response did not include regimentId, treat as failure
        } catch (err)
        {
            // If 5xx from upstream, retry; otherwise give up immediately
            const status = err?.response?.status;
            if (status && status >= 500 && attempt < maxAttempts)
            {
                await sleep(delays[attempt - 1]);
                continue;
            }
            return null;
        }
    }
    return null;
}

module.exports = {
    name: Events.MessageCreate,
    async execute(message)
    {
        const guildId = message.guild?.id;

        if (!guildId)
        {
            return;
        }

        const userState = waitingForImage[message.author.id];
        if (!message.author.bot && message.attachments.size > 0 && userState && userState.channelId === message.channelId)
        {
            const member = message.guild.members.cache.get(message.author.id);

            const hasAdminPermissions = member.permissions.has(PermissionsBitField.Flags.Administrator);
            const hasWorToolManagerRole = member.roles.cache.some(role => role.name === "WoRTool Manager");

            if (!(hasAdminPermissions || hasWorToolManagerRole))
            {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Permission Denied')
                    .setDescription("You need admin permissions or the 'WoRTool Manager' role to upload images.");
                message.reply({ embeds: [embed] });
                return;
            }

            const attachment = message.attachments.first();
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml'];

            if (allowedMimeTypes.includes(attachment.contentType) || allowedMimeTypes.includes(attachment.contentType?.toLowerCase()))
            {
                clearTimeout(userState.timeout);
                delete waitingForImage[message.author.id];

                try
                {
                    let regimentId = await fetchRegimentId(guildId);
                    let apiUnavailable = false;
                    if (!regimentId)
                    {
                        apiUnavailable = true;
                        regimentId = guildId; // fallback: use guild id as a safe local folder
                        console.warn(`Regiments API unavailable for guild ${guildId}, falling back to guildId`);
                    }

                    const mimeExtMap = {
                        'image/jpeg': '.jpg',
                        'image/png': '.png',
                        'image/gif': '.gif',
                        'image/webp': '.webp',
                        'image/bmp': '.bmp',
                        'image/tiff': '.tiff',
                        'image/svg+xml': '.svg'
                    };

                    const attachmentName = attachment.name || '';
                    const extFromName = path.extname(attachmentName);
                    const ext = extFromName || mimeExtMap[attachment.contentType] || '.jpg';

                    const randomFilename = `gallery-item-${makeId(5)}${ext}`;
                    const url = `[${message.guild.name}](<https://wortool.com/regiments/${regimentId}>)`;

                    const root = path.parse(process.cwd()).root;
                    const uploadsDir = path.join(root, 'www', 'apis', 'wortool_modern', 'resources', String(regimentId), 'static', 'assets', 'uploads');
                    fs.mkdirSync(uploadsDir, { recursive: true });

                    const filePath = path.join(uploadsDir, randomFilename);

                    const response = await axios({ url: attachment.url, method: 'GET', responseType: 'stream' });
                    const writer = fs.createWriteStream(filePath);
                    response.data.pipe(writer);
                    await finished(writer);

                    console.log('Saved to', filePath);
                    message.react('🖼️');

                    const successEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('Media Uploaded Successfully')
                        .setDescription(`Media has been saved to the server and added to ${url} WoRTool Page.`);

                    if (apiUnavailable)
                    {
                        successEmbed.addFields({ name: 'Note', value: 'WoRTool API was unavailable; item saved locally and may not appear on the website until the mapping is available.' });
                    }

                    message.reply({ embeds: [successEmbed] });
                } catch (error)
                {
                    console.error(error);
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Failed to Upload Image')
                        .setDescription('Failed to download or save the image.');
                    message.reply({ embeds: [errorEmbed] });
                }
            } else
            {
                const invalidImageEmbed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('Invalid Image Format')
                    .setDescription('Please upload a valid image.');
                message.reply({ embeds: [invalidImageEmbed] });
            }
        } else if (userState && userState.channelId === message.channelId)
        {
            const promptEmbed = new EmbedBuilder()
                .setColor('#FFFF00')
                .setTitle('Image Required')
                .setDescription('Please upload an image. Text messages are not processed for the /media command.');
            message.reply({ embeds: [promptEmbed] });
        }
    },
};

function makeId(length)
{
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++)
    {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
