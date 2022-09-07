/* ========================================== */
/*  SEBEDIUS DISCORD BOT                      */
/* ========================================== */
/*  Functionalities for Fria Ligan RPGs.      */
/*   @author Stefouch                         */
/*   (c) 2022 Stefouch                        */
/* ========================================== */

const PRODUCTION = process.env.NODE_ENV === 'production';

const Sebedius = require('./src/structures/sebedius-client');
const Logger = require('./src/utils/logger');

// First, loads the ENV variables (e.g. bot's token).
// if not in production mode.
if (!PRODUCTION) {
  require('dotenv').config();
}

// Because we need a lot of environment variables, we added a check.
// BETA_DISCORD_TOKEN & BETA_BOT_ID are also needed in develop environment.
(() => {
  const envVars = ['DISCORD_TOKEN', 'BOT_GUILD_ID', 'DATABASE_URI', 'OWNER_ID'];
  for (const env of envVars) if (!process.env[env]) throw new Error(`🔑 Missing ENV variable "${env}"`);
})();

/* ------------------------------------------ */

// Builds the client.
const client = new Sebedius({
  intents: require('./src/structures/sebedius-intents'),
});

client.startSebedius({
  token: PRODUCTION ? process.env.DISCORD_TOKEN : process.env.BETA_DISCORD_TOKEN,
  dbURI: process.env.DATABASE_URI,
  logWebhookURL: process.env.LOGWEBHOOK_URL,
  events: './src/events/**/*.js',
  commands: './src/commands/**/*.js',
});

/* ------------------------------------------ */
/*  ERRORS                                    */
/* ------------------------------------------ */

process.on('exit', code => {
  Logger.client(`ℹ Process exited with code ${code}`);
});

process.on('uncaughtException', (err, origin) => {
  Logger.error(`⛔ UNCAUGHT_EXCEPTION: ${err}\nOrigin: ${origin}`);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  Logger.warn(`⛔ UNHANDLED_REJECTION: ${reason}`);
  console.warn(promise);
});

process.on('warning', (...args) => {
  console.warn(...args);
});
