const path = require('node:path');
const { sync: globSync } = require('glob');
const Logger = require('../../utils/logger');

module.exports = async (client, pathPattern) => {
  globSync(pathPattern).map(commandFile => {

    /** @type {typeof import('../command')} */
    const cls = require(path.resolve(commandFile));
    const command = new cls(client);

    if (!command.name) {
      Logger.error(`"${commandFile}" → Command Loading Error: No Name!`);
    }

    if (!command.description) {
      Logger.error(`"${commandFile}" → Command Loading Error: No Description!`);
    }

    if (!command.category) {
      Logger.error(`"${commandFile}" → Command Loading Error: No Category!`);
    }

    if (!command.run) {
      Logger.error(`"${commandFile}" → Command Loading Error: Run Function Not Found!`);
    }

    client.commands.set(command.name, command);

    Logger.command(`Command loaded: ${command.name}`);
  });
};
