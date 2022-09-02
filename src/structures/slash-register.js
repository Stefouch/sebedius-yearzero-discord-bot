const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const Logger = require('../utils/logger');

/**
 * @param {string} clientId
 * @param {import('discord.js').Collection<string, import('./command')>} commands
 * @param {string} token
 * @param {string} botGuildId
 */
module.exports = async (clientId, commands, token, botGuildId) => {
  const [ownerOnlyCommands, globalCommands] = commands.partition(c => c.ownerOnly);

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    Logger.client(`↗️ Start refreshing ${commands.size} application (/) commands.`);

    const data = await Promise.all([
      await rest.put(
        Routes.applicationGuildCommands(clientId, botGuildId),
        { body: ownerOnlyCommands.map(c => c.data.toJSON()) },
      ),
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: globalCommands.map(c => c.data.toJSON()) },
      ),
    ]);

    // @ts-ignore
    Logger.client(`↙️ Successfully reloaded ${data.reduce((s, d) => s + d.length, 0)} application (/) commands.`);
  }
  catch (err) {
    Logger.error(err);
    console.error(err.stack);
  }
};
