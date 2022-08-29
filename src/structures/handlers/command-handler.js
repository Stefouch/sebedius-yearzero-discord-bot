const path = require('node:path');
const { sync: globSync } = require('glob');
const Logger = require('../../utils/logger');

module.exports = async (client, pathPattern) => {
  globSync(pathPattern).map(async commandFile => {

    /** @type {typeof import('../command')} */
    const cls = require(path.resolve(commandFile));
    const command = new cls(client);

    if (!command.name) {
      Logger.error(`Command Loading Error: No Name!\nFile -> "${commandFile}"`);
    }

    if (!command.description) {
      Logger.error(`Command Loading Error: No Description!\nFile -> "${commandFile}"`);
    }

    if (!command.category) {
      Logger.error(`Command Loading Error: No Category!\nFile -> "${commandFile}"`);
    }

    if (!command.run) {
      Logger.error(`Command Loading Error: Run Function Not Found!\nFile -> "${commandFile}"`);
    }

    client.commands.set(command.name, command);

    Logger.command(`Command loaded: ${command.name}`);
  });
};
