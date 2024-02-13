const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
require('dotenv').config();
const bearerToken = process.env.AUTH_SECRET;

module.exports = {
  isAdmin: true,
  isRoleManager: false,
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription("Add/Update your regiment's Discord server to the application.")
    .addStringOption(option =>
      option
        .setName('side')
        .setDescription('Choose your side (USA or CSA)')
        .setRequired(true)
        .addChoices(
          { name: 'USA', value: 'USA' },
          { name: 'CSA', value: 'CSA' }
        )),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const side = interaction.options.getString('side').toUpperCase();

    try {
      let invite = await interaction.channel.createInvite({
        maxAge: 0,
        maxUses: 0,
      });

      const guildName = interaction.guild.name;
      const guildAvatar = interaction.guild.iconURL();
      const guildInvite = invite.url;
      const ownerId = interaction.user.id;
      let memberCount = interaction.guild.memberCount;

      const config = {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      };

      axios.post('https://api.wortool.com/v2/regiments/create', {
        guildId: guildId,
        guildName: guildName,
        guildAvatar: guildAvatar,
        guildInvite: guildInvite,
        ownerId: ownerId,
        side: side,
        memberCount: memberCount,
      }, config)
      .then((response) => {
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

        interaction.reply({
          content: 
`# ${guildName} (${side})

### <@${ownerId}>, You are set as the regimental owner!

### Please __**re-login**__ on [wortool.com](<https://wortool.com/>) to gain access to your new tools & features!

- To see a list of available bot commands, type \`/help\`.
- To allow your staff and NCO's access to the management slash commands (/muster, /enlist, /media) assign them the \`WoRTool Manager\` role that was automatically created, or use command \`/promote\`.

## WorTool.com Web-Based Features
- You can have additional members sign up on wortool.com and join your regiment from their linked accounts section. *Discord members do not need to be registered on wortool.com to be enlisted to the company muster tool. However, your NCO's will need to be registered to access the web-based tools below.*
- Once members are registered and join your regiment on wortool.com you may promote them to managers by using the \`/promote\` slash command. \n*This will allow them access to management slash commands as well as the same Regimental Tools & Features you see below.*
`,
          components: [webLinksRow],
          ephemeral: true
        }).catch(console.error);
      }).catch((error) => {
        console.error(error);
        interaction.reply('❌ An error occurred while setting up the regiment.').catch(console.error);
      });
    } catch (error) {
      console.error(error);
      interaction.reply('❌ An error occurred while setting up the regiment.').catch(console.error);
    }
  },
};
