/**
 * @typedef {Object} SebediusCommandInteraction
 * @property {import('./sebedius-client')} client
 */

/**
 * @typedef {Object} SebediusCommandOptions
 * @property {boolean}                          [ownerOnly=false]
 * @property {SebediusCommand.CategoryFlagsBits} category
 * @property {import('discord.js').SlashCommandBuilder & any} data
 */

/**
 * @typedef {string} SebediusCommandCategory
 */

/**
 * @callback SebediusTranslationCallback t(key: string, { ...args }): string
 * @param {string|string[]}                 keys     Key(s) to translate
 * @param {Object.<string, string|number>} [options] 
 * @returns {string}
 * @property {string} lng Secret property that stores the language code
 */

/**
 * @callback SebediusCommandRunFunction
 * @param {SebediusCommandInteraction & import('discord.js').ChatInputCommandInteraction} interaction
 * @param {SebediusTranslationCallback} [t]
 * @param {Object}                      [guildOptions]
 * @returns {Promise.<any>}
 * @async
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
     * Whether the command is only available for the bot owner.
     * @type {boolean}
     */
    this.ownerOnly = !!options.ownerOnly;

    /**
     * The category of the command.
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
   * The bot client.
   * @alias this.client
   * @readonly
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
  async run(interaction, t, guildOptions) {
    throw new SyntaxError('Run Function Must Be Implemented!');
  }
}

/** @enum {number} */
SebediusCommand.CategoryFlagsBits = {
  ADMIN: 1 << 0,
  UTILS: 1 << 1,
  ROLL: 1 << 2,
};

module.exports = SebediusCommand;
