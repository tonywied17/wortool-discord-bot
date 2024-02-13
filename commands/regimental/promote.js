const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();
const bearerToken = process.env.AUTH_SECRET;

module.exports = {
  isAdmin: true,
  isRoleManager: false,
  data: new SlashCommandBuilder()
    .setName('promote')
    .setDescription("Promote a user to a regimental manager.")
    .addUserOption(option =>
      option.setName("member").setDescription("Select a user.").setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply();
    const guildId = interaction.guild.id;
    const user = interaction.options.getUser("member");

    try {
      const regimentsResponse = await axios.get(`https://api.wortool.com/v2/regiments/g/${guildId}/discordGuild`, { headers: { Authorization: `Bearer ${bearerToken}` } });
      const regimentId = regimentsResponse.data.regimentId;

      const usersResponse = await axios.get(`https://api.wortool.com/v2/regiments/${regimentId}/users`, { headers: { Authorization: `Bearer ${bearerToken}` } });
      const users = usersResponse.data;

      const targetUser = users.find(u => u.discordId === user.id);

      if (targetUser) {
        await axios.put(`https://api.wortool.com/v2/auth/${targetUser.id}/setModeratorDiscord`, {}, { headers: { Authorization: `Bearer ${bearerToken}` } });
      }

      const role = interaction.guild.roles.cache.find(r => r.name === "WoRTool Manager");
      if (!role) {
        return interaction.editReply({ content: "The WoRTool Manager role does not exist in this server.", ephemeral: true });
      }
      const member = await interaction.guild.members.fetch(user.id);
      if (!member.roles.cache.has(role.id)) {
        await member.roles.add(role);
      }

      const dmEmbed = new EmbedBuilder()
        .setColor('#425678') 
        .setTitle('You have been promoted!')
        .setDescription(`Congratulations! You have been promoted to a regimental manager on ${interaction.guild.name}. Please re-login to [WoRTool](https://wortool.com/) to access the web-based features.`)
        .addFields(
          { name: 'Additional Management Options', value: 'The `/help` command will now show additional management options available to you. Make sure to use these tools to effectively manage your regiment.' }
        )
        .setTimestamp();

      await user.send({ embeds: [dmEmbed] }).catch(error => console.error("Could not send DM to user.", error));

      const replyEmbed = new EmbedBuilder()
        .setColor('#425678') 
        .setTitle('Promotion Success') 
        .setDescription(targetUser ? `<@${user.id}> has been successfully promoted to a regimental manager.` : `<@${user.id}> has been assigned the "WoRTool Manager" role.`)
        .addFields(
          { name: 'Next Steps', value: targetUser ? 'Please have the user **re-login** to [wortool.com](https://wortool.com/) to access the web-based regimental management tools.' : 'Please sign up on [wortool.com](https://wortool.com/) and link your Discord account to access web-based features. You can now use bot commands to manage the regiment.' }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [replyEmbed] });
    } catch (error) {
      console.error("Error promoting user:", error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000') 
        .setTitle('Error Promoting User')
        .setDescription('An error occurred while trying to promote the user. Please try again later.')
        .setTimestamp(); 

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
