const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");
require("dotenv").config();
const bearerToken = process.env.AUTH_SECRET;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Add/Update your regiment's Discord server to the application.")
    .addStringOption((option) =>
      option
        .setName("side")
        .setDescription("Choose your side (USA or CSA)")
        .setRequired(true)
        .addChoices(
          { name: "USA", value: "USA" },
          { name: "CSA", value: "CSA" }
        )
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    let prefix;
    console.log('11:44AM')

    const side = interaction.options.getString("side").toUpperCase();

    try {
      let invite = await interaction.channel.createInvite({
        maxAge: 0, // 0 = infinite expiration
        maxUses: 0, // 0 = infinite uses
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

      axios.post("https://api.wortool.com/v2/regiments/create", {
        guildId: guildId,
        guildName: guildName,
        guildAvatar: guildAvatar,
        guildInvite: guildInvite,
        ownerId: ownerId,
        side: side,
        memberCount: memberCount,
        prefix: prefix,
      }, config)
      .then((response) => {
        console.log(response.data);
        interaction.reply(`## ${guildName} has been added!\n<@${ownerId}>, you have been set as the regimental owner. Please **re-login** to gain access to your new tools & features!`)
          .then(() => {
            interaction.followUp({
            content: `## Tools & Features
## [Manage Regiment](<https://wortool.com/mod/1>)\n
Organize your regiment's information, events schedule, media, and member list for optimal coordination.\n
## [Event Share Tool](<https://wortool.com/mod/2>)\n
Easily broadcast your event details within your Discord server to ensure maximum participation.\n
## [Steam Stats Tracker](<https://wortool.com/mod/3>)\n
Monitor and analyze Steam statistics and profiles of your members.\n
## [Company Tool](<https://wortool.com/mod/4>)\n
Track your members' attendance at events and drills, maintaining an active and engaged community.`,
            ephemeral: true
            }).catch(console.error);
          }).catch(console.error);
      }).catch((error) => {
        console.error(error);
        interaction.reply("❌ An error occurred while setting up the regiment.").catch(console.error);
      });
    } catch (error) {
      console.error(error);
      interaction.reply("❌ An error occurred while setting up the regiment.").catch(console.error);
    }
  },
};
