/**
 * @typedef {import('discord.js').ChatInputCommandInteraction
 *   & { client: import('./sebedius-client')}} SebediusCommandInteraction
 */

/**
 * @typedef {Object} SebediusCommandOptions
 * @property {boolean}                          [ownerOnly=false]  Owner-only commands are only registered
 *   in the bot dedicated guild
 * @property {SebediusCommand.CategoryFlagsBits} category          The category of the command
 * @property {import('discord.js').SlashCommandBuilder & any} data Slash command data
 */

/**
 * @typedef {Object} GuildOptions
 * @property {string}                               [_id]       The ID of the guild
 * @property {import('../constants').YearZeroGames} [game]      The game chosen for the guild
 * @property {import('discord.js').LocaleString}    [locale]    The locale chosen for the guild
 * @property {boolean}                              [isBanned]  Whether the guild is banned from using the bot
 * @property {Date}                                 [banDate]   The date when the guild was banned, if any
 * @property {string}                               [banReason] The reason the guild was banned, if any
 */

/**
 * @callback SebediusTranslationCallback t(key: string, { ...args }): string
 * @param {string|string[]}                 keys     Key(s) to translate
 * @param {Object.<string, string|number>} [options] Properties passed to the translation job
 * @returns {string}
 * @property {string} lng Secret property that stores the language code
 */

/**
 * @callback SebediusCommandRunFunction
 * @param {SebediusCommandInteraction}   interaction
 * @param {SebediusTranslationCallback & { lng: string }} [t]
 * @param {GuildOptions}                [guildOptions]
 * @returns {Promise.<any>}
 */

/* ------------------------------------------ */

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
