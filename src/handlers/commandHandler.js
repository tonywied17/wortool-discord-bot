const fs = require("fs");
const { Collection } = require("discord.js");
const path = require("path");

module.exports = {
  loadCommands(client, dir) {
    const commandFiles = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of commandFiles) {
      if (file.isDirectory()) {
        const subDir = path.join(dir, file.name);
        module.exports.loadCommands(client, subDir);
        continue;
      }

      if (!file.name.endsWith(".js")) continue;

      const command = require(path.resolve(dir, file.name));
      console.log("Loaded command:", command.name); // Add this line
      client.commands.set(command.name, command);
    }
  },
};
