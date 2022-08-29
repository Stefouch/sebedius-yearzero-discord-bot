/* ========================================== */
/*  SEBEDIUS DISCORD BOT                      */
/* ========================================== */
/*  Functionalities for Fria Ligan RPGs.      */
/*   @author Stefouch                         */
/*   (c) 2022 Stefouch                        */
/* ========================================== */

const Sebedius = require('./src/discord/client');
const intents = require('./src/discord/sebedius-intents');
const handleEvents = require('./src/discord/handlers/event-handler');
const handleCommands = require('./src/discord/handlers/command-handler');

// First, loads the ENV variables (e.g. bot's token).
// if not in production mode.
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

/* ------------------------------------------ */

// Builds the client.
const client = new Sebedius({ intents });

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
  console.error(`ℹ Process exited with code ${code}`);
});

process.on('uncaughtException', (err, origin) => {
  console.error(`⛔ UNCAUGHT_EXCEPTION: ${err}`, `Origin: ${origin}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`⛔ UNHANDLED_REJECTION: ${reason}`, promise);
});

process.on('warning', (...args) => {
  console.warn(...args);
});

/* ------------------------------------------ */
/*  LOGIN                                     */
/* ------------------------------------------ */

// Logs the client to Discord.
client.login(process.env.DISCORD_TOKEN);
