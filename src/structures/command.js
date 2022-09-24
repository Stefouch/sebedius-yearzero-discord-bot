// @ts-nocheck
const { SlashCommandBuilder, ApplicationCommandOptionType, SlashCommandAssertions } = require('discord.js');
const { YearZeroGameNames } = require('../constants');

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
    this.category = options.category;

    /**
     * Slash command builder data.
     * @type {import('discord.js').SlashCommandBuilder}
     */
    this.data = options.data;

    if (this.data) this.#addLocalizations();
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

  /**
   * Adds all localizations to the command.
   */
  #addLocalizations() {
    for (const lng of this.bot.config.SupportedLocales.map(l => l.value)) {
      if (lng === this.bot.config.defaultLocale) continue;

      const name = this.bot.i18n.getResource(lng, 'commands', `${this.name}.name`);
      const desc = this.bot.i18n.getResource(lng, 'commands', `${this.name}.description`);

      if (name) this.data.setNameLocalization(lng, name);
      if (desc) this.data.setDescriptionLocalization(lng, desc);

      if (this.data.options.length) {
        for (const option of this.data.options) {
          this.#localizeCommandOption(lng, option, `${this.name}.options`);
          if (option.options?.length) {
            option.options.forEach(opt => {
              this.#localizeCommandOption(lng, opt, `${this.name}.options.${option.name}.options`);
            });
          }
        }
      }
    }
  }

  /* ------------------------------------------ */

  /**
   * Sets the localized name & description for a command option.
   * @param {string} lng Locale
   * @param {Object} option
   * @param {string} keyPrefix
   */
  #localizeCommandOption(lng, option, keyPrefix) {
    const localizedOptionName =
    this.bot.i18n.getResource(lng, 'commands', `${keyPrefix}.${option.name}.name`);
    const localizedOptionDescription =
    this.bot.i18n.getResource(lng, 'commands', `${keyPrefix}.${option.name}.description`);

    if (localizedOptionName) {
      if (!option.name_localizations) option.name_localizations = {};
      try {
        SlashCommandAssertions.validateName(localizedOptionName);
      }
      catch (err) {
        throw new Error(
          `CommandLocalizationError[${keyPrefix}]: Invalid name for option ${option.name}!`,
          { cause: err },
        );
      }
      option.name_localizations[lng] = localizedOptionName;
    }

    if (localizedOptionDescription) {
      if (!option.description_localizations) option.description_localizations = {};
      try {
        SlashCommandAssertions.validateDescription(localizedOptionDescription);
      }
      catch (err) {
        throw new Error(
          `CommandLocalizationError[${keyPrefix}]: Invalid description for option ${option.name}!`,
          { cause: err },
        );
      }
      option.description_localizations[lng] = localizedOptionDescription;
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
  createSlashCommandBuilder(name, description, GameSubcommandsList, SlashCommandOptions) {
    const data = new SlashCommandBuilder()
      .setName(name)
      .setDescription(description)
      .setNameLocalizations(this.#getLocalizations(`${name}.name`))
      .setDescriptionLocalizations(this.#getLocalizations(`${name}.description`));

    for (const [game, options] of Object.entries(GameSubcommandsList)) {
      data.addSubcommand(sub => {
        sub
          .setName(game)
          .setDescription(YearZeroGameNames[game]);

        for (const optionName of options) {
          const option = SlashCommandOptions[optionName];
          if (!option) throw new SyntaxError(`[${name}:${game}] Option "${optionName}" Not Found!`);
          this.addOptionToCommand(name, sub, optionName, option);
        }
        return sub;
      });
    }
    return data;
  }

  /* ------------------------------------------ */

  /**
   * 
   * @param {string}   cmdName             The name of the command
   * @param {import('discord.js').SlashCommandBuilder} cmd    The command or subcommand Builder
   * @param {string}   optionName          The name of the command option
   * @param {SebediusCommand.SlashCommandOption}       option The data for creating the command option
   * @param {Object}  [options]                    Additional options for this method
   * @param {boolean} [options.allowRequired=true] Whether to ignore the "required" property
   * @param {string}  [options.overrideCmdName]    Replacement name when searching for translations
   */
  addOptionToCommand(
    cmdName,
    cmd,
    optionName,
    option,
    {
      allowRequired = true,
      overrideCmdName = '',
    } = {},
  ) {
    if (overrideCmdName) cmdName = overrideCmdName;
    if (!option.choices) option.choices = [];

    switch (option.type) {
      case ApplicationCommandOptionType.String:
        cmd.addStringOption(opt => opt
          .setName(optionName)
          .setDescription(option.description)
          .setRequired(allowRequired && !!option.required)
          .addChoices(...option.choices)
          .setNameLocalizations(this.#getLocalizations(`${cmdName}.options.${optionName}.name`))
          .setDescriptionLocalizations(this.#getLocalizations(`${cmdName}.options.${optionName}.description`)));
        break;
      case ApplicationCommandOptionType.Integer:
        cmd.addIntegerOption(opt => opt
          .setName(optionName)
          .setDescription(option.description)
          .setMinValue(option.min ?? 1)
          .setMaxValue(option.max ?? 100)
          .setRequired(allowRequired && !!option.required)
          .addChoices(...option.choices)
          .setNameLocalizations(this.#getLocalizations(`${cmdName}.options.${optionName}.name`))
          .setDescriptionLocalizations(this.#getLocalizations(`${cmdName}.options.${optionName}.description`)));
        break;
      case ApplicationCommandOptionType.Boolean:
        cmd.addBooleanOption(opt => opt
          .setName(optionName)
          .setDescription(option.description)
          .setRequired(allowRequired && !!option.required)
          .setNameLocalizations(this.#getLocalizations(`${cmdName}.options.${optionName}.name`))
          .setDescriptionLocalizations(this.#getLocalizations(`${cmdName}.options.${optionName}.description`)));
        break;
      default: throw new TypeError(`[${cmdName}] Type Not Found for Command Option "${optionName}"!`);
    }
  }

  /* ------------------------------------------ */

  /**
   * Gets the localizations object for the name or the description of a command
   * or its options/arguments.
   * @param {string} commandName
   * @param {string} optionName
   * @returns {Object.<import('discord.js').LocaleString, string>}
   */
  #getLocalizations(key) {
    const localizations = {};
    for (const lng of this.bot.config.SupportedLocales.map(l => l.value)) {
      if (lng === this.bot.config.defaultLocale) continue;
      const localizedName = this.bot.i18n.getResource(lng, 'commands', `${key}`);
      if (localizedName) localizations[lng] = localizedName;
    }
    return localizations;
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
