/**
 * @typedef {Object} SebediusCommandInteraction
 * @property {import('./sebedius-client')} client
 */

/**
 * @typedef {Object} SebediusCommandOptions
 * @property {SebediusCommand.CategoryFlagsBits} category
 * @property {import('discord.js').SlashCommandBuilder} data
 */

/**
 * @typedef {string} SebediusCommandCategory
 */

/**
 * @callback SebediusCommandRunFunction
 * @param {SebediusCommandInteraction & import('discord.js').ChatInputCommandInteraction} interaction
 * @param {SebediusCommandTranslationCallback} [t]
 * @returns {Promise.<any>}
 * @async
 */

/**
 * @callback SebediusCommandTranslationCallback t(key: string, { ...args }): string
 * @param {string} key
 * @param {Object.<string, string>} [args]
 * @returns {string}
 */

class SebediusCommand {
  /**
   * @param {import('./sebedius-client')} client
   * @param {SebediusCommandOptions}     [options]
   */
  constructor(client, options) {
    /**
     * The bot client.
     * @type {import('./sebedius-client')}
     */
    this.client = client;

    /**
     * The category of the command
     * @type {SebediusCommand.CategoryFlagsBits}
     */
    this.category = options.category || SebediusCommand.CategoryFlagsBits.UTILS;

    /**
     * Slash command builder data.
     * @type {import('discord.js').SlashCommandBuilder}
     */
    this.data = options.data;
  }

  /**
   * @readonly
   * @alias this.client
   */
  get bot() {
    return this.client;
  }

  get name() {
    return this.data.name;
  }

  get description() {
    return this.data.description;
  }

  /**
   * Run method executed by the command.
   * @type {SebediusCommandRunFunction}
   */
  // eslint-disable-next-line no-unused-vars
  async run(interaction, t) {
    throw new SyntaxError('Run Function Must Be Implemented!');
  }
}

/** @enum {number} */
SebediusCommand.CategoryFlagsBits = {
  ADMIN: 1 << 0,
  UTILS: 1 << 1,
};

module.exports = SebediusCommand;
