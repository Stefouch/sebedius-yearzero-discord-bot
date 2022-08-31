const path = require('node:path');
const { sync: globSync } = require('glob');
const Logger = require('../../utils/logger');

module.exports = async (client, pathPattern) => {
  globSync(pathPattern).map(async buttonFile => {

    /** @type {typeof import('../command')} */
    const cls = require(path.resolve(buttonFile));
    const button = new cls(client);

    // if (!button.name) {
    //   Logger.error(`Command Loading Error: No Name!\nFile -> "${buttonFile}"`);
    // }

    // if (!button.description) {
    //   Logger.error(`Command Loading Error: No Description!\nFile -> "${buttonFile}"`);
    // }

    // if (!button.category) {
    //   Logger.error(`Command Loading Error: No Category!\nFile -> "${buttonFile}"`);
    // }

    // if (!button.run) {
    //   Logger.error(`Command Loading Error: Run Function Not Found!\nFile -> "${buttonFile}"`);
    // }

    client.commands.set(button.name, button);

    Logger.command(`Command loaded: ${button.name}`);
  });
};
