const Sebedius = require('./src/structures/sebedius-client');
const registerSlashCommands = require('./src/structures/slash-register');
require('dotenv').config();

const production = process.env.NODE_ENV === 'production';

const client = new Sebedius({
  intents: require('./src/structures/sebedius-intents'),
});

registerSlashCommands(
  client,
  production ? process.env.BOT_ID : process.env.BETA_BOT_ID,
  process.env.BOT_GUILD_ID,
  production ? process.env.DISCORD_TOKEN : process.env.BETA_DISCORD_TOKEN,
);
