const path = require('node:path');
const { sync: globSync } = require('glob');

module.exports = async (client, pathPattern) => {
  globSync(pathPattern).map(async eventFile => {

    /** @type {typeof import('../event')} */
    const cls = require(path.resolve(eventFile));
    const event = new cls(client);

    if (!event.name) {
      console.error(`❌ Event Loading Error: Wrong Name!\nFile -> "${eventFile}"`);
    }

    // Registers all imported events.
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    }
    else {
      client.on(event.name, (...args) => event.execute(...args));
    }

    console.log(`Event loaded: ${event.name}`);
  });
};
