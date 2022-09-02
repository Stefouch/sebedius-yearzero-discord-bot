const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const handleCommands = require('./handlers/command-handler');
const Logger = require('../utils/logger');

/**
 * @param {import('./sebedius-client')} client
 * @param {string} clientId
 * @param {string} botGuildId
 * @param {string} token
 */
module.exports = async (client, clientId, botGuildId, token) => {
  await handleCommands(client, './src/commands/**/*.js');
  const [ownerOnlyCommands, globalCommands] = client.commands.partition(c => c.ownerOnly);

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    Logger.client(`↗️ Start refreshing ${client.commands.size} application (/) commands.`);

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
