const path = require('node:path');
const { glob } = require('glob');

const evGlobPattern = './src/commands/*/*.js';

module.exports = async client => {
  glob.sync(evGlobPattern).map(async commandFile => {

    /** @type {import('../command.js')} */
    const command = require(path.resolve(commandFile));

    if (!command.name) {
      console.error(`Command Loading Error → No Name!\nFile → "${commandFile}"`);
    }

    if (!command.description) {
      console.error(`Command Loading Error → No Description!\nFile → "${commandFile}"`);
    }

    if (!command.run) {
      console.error(`Command Loading Error → Run Function Not Found!\nFile → "${commandFile}"`);
    }

    client.commands.set(command.name, command);

    console.log(`Command loaded: ${command.name}`);
  });
};
