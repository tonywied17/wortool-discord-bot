const guildCreate = require('./guildCreate');
const messageCreate = require('./messageCreate');
const guildMemberAdd = require('./guildMemberAdd');
const guildMemberRemove = require('./guildMemberRemove');
const guildUpdate = require('./guildUpdate');
const onReady = require('./onReady');


module.exports = {
    guildCreate,
    messageCreate,
    guildMemberAdd,
    guildMemberRemove,
    guildUpdate,
    onReady,
  };
  