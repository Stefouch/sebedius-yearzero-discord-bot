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

/* ------------------------------------------ */

// Builds the client.
const client = new Sebedius({
  intents: require('./src/structures/sebedius-intents'),
});

client.startSebedius({
  token: PRODUCTION ? process.env.DISCORD_TOKEN : process.env.BETA_DISCORD_TOKEN,
  dbURI: process.env.DATABASE_URI,
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
