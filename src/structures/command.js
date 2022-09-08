const { SlashCommandBuilder, ApplicationCommandOptionType } = require('discord.js');
const { YearZeroGameNames } = require('../constants');
const { isObjectEmpty } = require('../utils/object-utils');

/**
 * Sebedius Command.
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

    if (this.data) this.addLocalizations();
  }

  /* ------------------------------------------ */

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

  /* ------------------------------------------ */

  /**
   * Run method executed by the command.
   * @type {SebediusCommandRunFunction}
   */
  // eslint-disable-next-line no-unused-vars
  async run(interaction, t, guildOptions) {
    throw new SyntaxError('Run Function Must Be Implemented!');
  }

  /* ------------------------------------------ */

  addLocalizations() {
    const nameLocalizations = {};
    const descriptionLocalizations = {};
    for (const lng of this.bot.config.SupportedLocales.map(l => l.value)) {
      if (lng === this.bot.config.defaultLocale) continue;
      const name = this.bot.i18n.getResource(lng, 'commands', `${this.name}.name`);
      const desc = this.bot.i18n.getResource(lng, 'commands', `${this.name}.description`);
      if (name) nameLocalizations[lng] = name;
      if (desc) descriptionLocalizations[lng] = desc;
      if (this.data.options) {
        for (const option of this.data.options) {
          // TODO localize options
        }
      }
    }
    if (!isObjectEmpty(nameLocalizations)) {
      this.data.setNameLocalizations(nameLocalizations);
    }
    if (!isObjectEmpty(descriptionLocalizations)) {
      this.data.setDescriptionLocalizations(descriptionLocalizations);
    }
  }

  /* ------------------------------------------ */

  /**
   * Builds the roll slash command, subcommands & options.
   * @param {string} name
   * @param {string} description
   * @param {Object.<import('../constants').YearZeroGames, string[]>} GameSubcommandsList
   * @param {Object.<string, SlashCommandOption>} SlashCommandOptions
   * @returns {SlashCommandBuilder}
   */
  static createSlashCommandBuilder(name, description, GameSubcommandsList, SlashCommandOptions) {
    const data = new SlashCommandBuilder()
      .setName(name)
      .setDescription(description);

    for (const [game, options] of Object.entries(GameSubcommandsList)) {
      data.addSubcommand(sub => {
        sub.setName(game).setDescription(YearZeroGameNames[game]);
        for (const optionName of options) {
          const option = SlashCommandOptions[optionName];
          if (!option) throw new SyntaxError(`[${name}:${game}] Option "${optionName}" Not Found!`);
          if (!option.choices) option.choices = [];
          switch (option.type) {
            case ApplicationCommandOptionType.String:
              sub.addStringOption(opt => opt
                .setName(optionName)
                .setDescription(option.description)
                .setRequired(!!option.required)
                // @ts-ignore
                .addChoices(...option.choices));
              break;
            case ApplicationCommandOptionType.Integer:
              sub.addIntegerOption(opt => opt
                .setName(optionName)
                .setDescription(option.description)
                .setMinValue(option.min ?? 1)
                .setMaxValue(option.max ?? 100)
                .setRequired(!!option.required)
                // @ts-ignore
                .addChoices(...option.choices));
              break;
            case ApplicationCommandOptionType.Boolean:
              sub.addBooleanOption(opt => opt
                .setName(optionName)
                .setDescription(option.description)
                .setRequired(!!option.required));
              break;
            default: throw new TypeError(`[${name}:${game}] Type Not Found for Command Option "${optionName}"!`);
          }
        }
        return sub;
      });
    }
    return data;
  }
}

/* ------------------------------------------ */

/** @enum {number} */
SebediusCommand.CategoryFlagsBits = {
  ADMIN: 1 << 0,
  UTILS: 1 << 1,
  ROLL: 1 << 2,
};

/* ------------------------------------------ */

module.exports = SebediusCommand;

/* ------------------------------------------ */
/*  Types Definitions                         */
/* ------------------------------------------ */

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

// /**
//  * @callback SebediusTranslationCallback t(key: string, { ...args }): string
//  * @param {string|string[]}                 keys     Key(s) to translate
//  * @param {Object.<string, string|number>} [options] Properties passed to the translation job
//  * @returns {string}
//  * @property {import('discord.js').LocaleString} lng Secret property that stores the language code
//  */

/**
 * @typedef {import('i18next').TFunction & { lng: import('discord.js').LocaleString }} SebediusTranslationCallback
 */

/**
 * @callback SebediusCommandRunFunction
 * @param {SebediusCommandInteraction}   interaction
 * @param {SebediusTranslationCallback} [t]
 * @param {GuildOptions}                [guildOptions]
 * @returns {Promise.<any>}
 */

/**
 * @typedef {Object} SlashCommandOption
 * @property {string}   description
 * @property {number}   type
 * @property {boolean} [required=false]
 * @property {number}  [min]
 * @property {number}  [max]
 * @property {import('discord.js').APIApplicationCommandOptionChoice<string|number>[]} [choices]
 */
