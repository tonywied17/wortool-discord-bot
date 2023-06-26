module.exports = {
    name: "setup",
    description: "Add your regiment to the App",
    aliases: ["init", "addreg"],
    category: "Moderation",
    isAdmin: true, 
    execute(message, args) {
      // Add your database regiment logic here

      message.channel.send("Initialize Setup of Regiment")
    }
  };
  