const path = require('node:path');
const { glob } = require('glob');

const evGlobPattern = './src/events/*/*.js';
const allowedEvents = ['ready', 'messageCreate', 'interactionCreate'];

module.exports = async client => {
  glob.sync(evGlobPattern).map(async eventFile => {

    /** @type {import('../event.js')} */
    const event = require(path.resolve(eventFile));

    if (!allowedEvents.includes(event.name) || !event.name) {
      console.error(`❌ Event Loading Error | Wrong Name!\nFile → "${eventFile}"`);
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(client, ...args));
    }
    else {
      client.on(event.name, (...args) => event.execute(client, ...args));
    }

    console.log(`Event loaded: ${event.name}`);
  });
};
