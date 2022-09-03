const Sebedius = require('./src/structures/sebedius-client');
const handleCommands = require('./src/structures/handlers/command-handler');
const registerSlashCommands = require('./src/structures/slash-register');

const production = process.env.NODE_ENV === 'production';

if (!production) {
  require('dotenv').config();
  console.log('🛠️ DEVELOP MODE: Register for the BETA BOT');
}
else {
  console.log('🚀 PRODUCTION MODE: Register for the SEBEDIUS BOT');
}

const client = new Sebedius({
  intents: require('./src/structures/sebedius-intents'),
});

(async () => {
  try {
    await handleCommands(client, './src/commands/**/*.js');
    await registerSlashCommands(
      production ? process.env.BOT_ID : process.env.BETA_BOT_ID,
      client.commands,
      production ? process.env.DISCORD_TOKEN : process.env.BETA_DISCORD_TOKEN,
      process.env.BOT_GUILD_ID,
    );
  }
  catch (err) {
    console.error(err);
  }
})();
