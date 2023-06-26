const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "setup",
  description: "Add your regiment to the App",
  aliases: ["init", "addreg"],
  category: "Moderation",
  isAdmin: true,
  async execute(message, args) {
    try {
      let invite = await message.channel.createInvite({
        maxAge: 0, // 0 = infinite expiration
        maxUses: 0 // 0 = infinite uses
      }).catch(console.error);

      const guildId = message.guild.id;
      const guildAvatar = message.guild.iconURL();
      const authorId = message.author.id;

      let member = message.mentions.members.first();

      let memberx = message.member;
      let serverNickname = memberx ? memberx.displayName : null;

      const embed = new EmbedBuilder()
        .setColor("#7c7d72")
        .setTitle("Regiment Setup Information")
        .addFields({ name: "Guild ID", value: guildId })
        .addFields({ name: "Guild Name", value: message.guild.name })
        .addFields({ name: "Guild Avatar", value: guildAvatar })
        .addFields({ name: "Guild Invite", value: invite.url })
        .addFields({ name: "Regiment Owner Discord ID", value: authorId })
        .addFields({ name: "Regiment Owner Nickname", value: serverNickname })
        .setTimestamp();

      console.log(`Guild ID: ${guildId}`);
      console.log(`Guild Name: ${message.guild.name}`);
      console.log(`Guild Avatar: ${guildAvatar}`);
      console.log(`Guild Invite: ${invite.url}`);
      console.log(`Author ID: ${authorId}`);
      console.log(`Server Nickname: ${serverNickname}`);

      message.channel.send({ embeds: [embed] });
      message.channel.send("Initialize Regiment Model, Sequelize, and Database.");
    } catch (error) {
      console.error(error);
      message.channel.send("An error occurred while setting up the regiment.");
    }
  }
};
