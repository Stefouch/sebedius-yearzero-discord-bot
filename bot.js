/* ========================================== */
/*  SEBEDIUS DISCORD BOT                      */
/* ========================================== */
/*  Functionalities for Fria Ligan RPGs.      */
/*   @author Stefouch                         */
/*   (c) 2022 Stefouch                        */
/* ========================================== */

const Sebedius = require('./src/structures/sebedius-client');
const intents = require('./src/structures/sebedius-intents');
const handleEvents = require('./src/structures/handlers/event-handler');
const handleCommands = require('./src/structures/handlers/command-handler');
const loadLocales = require('./src/locales/i18n');
const Logger = require('./src/utils/logger');

// First, loads the ENV variables (e.g. bot's token).
// if not in production mode.
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

/* ------------------------------------------ */

// Builds the client.
const client = new Sebedius({ intents });

/* ------------------------------------------ */
/*  LOCALES                                   */
/* ------------------------------------------ */

loadLocales();

/* ------------------------------------------ */
/*  HANDLERS                                  */
/* ------------------------------------------ */

// Grafts our events & commands handlers to the client.
handleEvents(client, './src/events/*/*.js');
handleCommands(client, './src/commands/*/*.js');

/* ------------------------------------------ */
/*  ERRORS                                    */
/* ------------------------------------------ */

process.on('exit', code => {
  Logger.client(`ℹ Process exited with code ${code}`);
});

process.on('uncaughtException', (err, origin) => {
  Logger.error(`⛔ UNCAUGHT_EXCEPTION: ${err}\nOrigin: ${origin}`);
  console.error(err);
});

process.on('unhandledRejection', (reason, promise) => {
  Logger.warn(`⛔ UNHANDLED_REJECTION: ${reason}`);
  console.warn(promise);
});

process.on('warning', (...args) => {
  console.warn(...args);
});

/* ------------------------------------------ */
/*  LOGIN                                     */
/* ------------------------------------------ */

// Logs the client to Discord.
client.login(process.env.DISCORD_TOKEN);
