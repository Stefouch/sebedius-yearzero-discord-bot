/* ========================================== */
/*  SEBEDIUS DISCORD BOT                      */
/* ========================================== */
/*  Functionalities for Fria Ligan RPGs.      */
/*   @author Stefouch                         */
/*   (c) 2022 Stefouch                        */
/* ========================================== */

const mongoose = require('mongoose');
const Sebedius = require('./src/discord/client');
const handleEvents = require('./src/discord/handlers/event-handler');
const handleCommands = require('./src/discord/handlers/command-handler');

// First, loads the ENV variables (e.g. bot's token).
// if not in production mode.
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

/* ------------------------------------------ */

// Builds the client.
const client = new Sebedius();

/* ------------------------------------------ */
/*  HANDLERS                                  */
/* ------------------------------------------ */

// Grafts our events & commands handlers to the client.
handleEvents(client);
handleCommands(client);

/* ------------------------------------------ */
/*  DATABASE                                  */
/* ------------------------------------------ */

// Connects to the database.
mongoose.connect(process.env.DATABASE_URI, {
  autoIndex: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
}).then(() => console.log('✔ Sebedius is connected to the DB!'))
  .catch(err => console.error(err));

/* ------------------------------------------ */
/*  ERRORS                                    */
/* ------------------------------------------ */

process.on('exit', code => {
  console.error(`⚠ Process exited with code: ${code}`);
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
// client.login(process.env.DISCORD_TOKEN);
