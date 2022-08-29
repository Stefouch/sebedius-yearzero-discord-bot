const path = require('node:path');
const { sync: globSync } = require('glob');

module.exports = async (client, pathPattern) => {
  globSync(pathPattern).map(async commandFile => {

    /** @type {typeof import('../command')} */
    const cls = require(path.resolve(commandFile));
    const command = new cls(client);

    if (!command.name) {
      console.error(`Command Loading Error: No Name!\nFile -> "${commandFile}"`);
    }

    if (!command.description) {
      console.error(`Command Loading Error: No Description!\nFile -> "${commandFile}"`);
    }

    if (!command.category) {
      console.error(`Command Loading Error: No Category!\nFile -> "${commandFile}"`);
    }

    if (!command.run) {
      console.error(`Command Loading Error: Run Function Not Found!\nFile -> "${commandFile}"`);
    }

    client.commands.set(command.name, command);

    console.log(`Command loaded: ${command.name}`);
  });
};
