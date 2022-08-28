const path = require('node:path');
const { sync: globSync } = require('glob');

module.exports = async (client, pathPattern) => {
  globSync(pathPattern).map(async eventFile => {

    /** @type {import('../event.js')} */
    const event = require(path.resolve(eventFile));

    if (!event.name) {
      console.error(`❌ Event Loading Error: Wrong Name!\nFile -> "${eventFile}"`);
    }

    // Registers all imported events.
    if (event.once) {
      client.once(event.name, (...args) => event.execute(client, ...args));
    }
    else {
      client.on(event.name, (...args) => event.execute(client, ...args));
    }

    console.log(`Event loaded: ${event.name}`);
  });
};
