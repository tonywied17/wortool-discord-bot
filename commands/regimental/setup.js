const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
require('dotenv').config();
const webhookSecret = process.env.WEBHOOK_SECRET;

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
          'x-webhook-secret': webhookSecret,
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
`# ${guildName} (${side}) Setup Complete!
 ## ${interaction.user.displayName}, you're now the regiment owner.
> Please **re-login** at [wortool.com](<https://wortool.com/>) to access your new tools & features.

Type \`/help\` for a list for available commands.
Type \`/adminhelp\` for a list of admin & management information.
          
**🔧 Management Commands Access**
Grant your staff and NCOs access to management commands (\`/muster\`, \`/enlist\`, \`/media\`) by assigning them the \`WoRTool Manager\` role, or use \`/promote\`.
          
**🌐 WorTool.com Integration**
Encourage members to sign up at wortool.com and join your regiment. While Discord members can be enlisted into the company roster without a wortool.com account, NCOs must register and sync their Discord account in their 'Linked Accounts' settings to access web-based tools.
        
**👥 Promoting Regiment Managers**
Use \`/promote\` after member registration to grant them access to Discord commands and web-based Regimental Tools & Features.`,
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
