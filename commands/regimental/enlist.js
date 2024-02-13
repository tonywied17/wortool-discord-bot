const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const axios = require("axios");
require("dotenv").config();
const currentDate = new Date();
const today = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getDate().toString().padStart(2, "0")}`;
const bearerToken = process.env.AUTH_SECRET;

module.exports = {
  isAdmin: false,
  isRoleManager: true,
  data: new SlashCommandBuilder()
    .setName("enlist")
    .setDescription("Enlist users into your Regiment's Roster")
    .addSubcommand(subcommand =>
      subcommand
        .setName("role")
        .setDescription("Mass enlist users by a selected role.")
        .addRoleOption(option =>
          option.setName("role").setDescription("Select a Discord Role").setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("users")
        .setDescription("Manually select users for enlistment.")
        .addUserOption(option =>
          option.setName("target").setDescription("Select users.").setRequired(true)
        )
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const guildAvatar = interaction.guild.iconURL();
    const regimentIdResponse = await axios.get(`https://api.wortool.com/v2/regiments/g/${guildId}/discordGuild`, {
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
    });
    const regimentId = regimentIdResponse.data.regimentId;

    const existingUsersResponse = await axios.get(`https://api.wortool.com/v2/musteruser/discord/${guildId}`, {
      headers: { "Authorization": `Bearer ${bearerToken}` },
    });
    const existingUsers = existingUsersResponse.data;

    let usersToProcess = [];

    if (interaction.options.getSubcommand() === "role") {
      const role = interaction.options.getRole("role");
      await interaction.guild.members.fetch();

      role.members.forEach(member => {
        if (!existingUsers.some(user => user.discordId === member.id)) {
          usersToProcess.push({
            discordId: member.id,
            nickname: member.displayName,
          });
        }
      });

      console.log(`Filtered users to enlist: ${usersToProcess.length}`);

    } else if (interaction.options.getSubcommand() === "users") {
      const user = interaction.options.getUser("target");
      const member = await interaction.guild.members.fetch(user.id);

      if (!existingUsers.some(existingUser => existingUser.discordId === user.id)) {
        usersToProcess.push({
          discordId: user.id,
          nickname: member.displayName,
        });
      }
    }

    if (usersToProcess.length > 0) {
      const usersData = usersToProcess.map(user => ({
        discordId: user.discordId,
        nickname: user.nickname,
        regimentId: regimentId,
        join_date: today,
        last_muster: today,
        events: 0,
        drills: 0,
      }));

      try {
        await axios.post("https://api.wortool.com/v2/musteruser/create", usersData, {
          headers: { "Authorization": `Bearer ${bearerToken}` },
        });

        const embed = new EmbedBuilder()
          .setColor("#425678")
          .setTitle("Roster Enlistment")
          .setThumbnail(guildAvatar)
          .setDescription(`${usersData.length} user(s) enlisted successfully.`)
          .setTimestamp();

        usersData.forEach((user, index) => {
          embed.addFields({
            name: `#${index + 1} ${user.nickname}`,
            value: `> <@${user.discordId}>\n> **Enlisted On**: ${today}`,
          });
        });

        interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error("Error enlisting users:", error);
        interaction.reply("An error occurred while enlisting users.");
      }
    } else {
      interaction.reply("All selected users are already enlisted or no valid users were selected.");
    }
  },
};
