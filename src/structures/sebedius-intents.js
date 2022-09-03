const { GatewayIntentBits } = require('discord.js');

module.exports = [
  GatewayIntentBits.Guilds,
  // Discord.Intents.FLAGS.GUILD_PRESENCES,
  // Discord.Intents.FLAGS.GUILD_MEMBERS,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.DirectMessages,
  GatewayIntentBits.DirectMessageReactions,
];
