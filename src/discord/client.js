const Discord = require('discord.js');
const SebediusIntents = require('./sebedius-intents.js');

/** @typedef {import('./command.js')} SebediusCommand */

class Sebedius extends Discord.Client {
  /** @inheritdoc */
  constructor(options) {
    const cfg = {
      intents: SebediusIntents,
      ...options,
    };
    super(cfg);

    /**
     * Collection containing all the bot commands.
     * @type {Discord.Collection<string, SebediusCommand>}
     */
    this.commands = new Discord.Collection();
  }
}

module.exports = Sebedius;
