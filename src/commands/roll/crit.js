const {
  SlashCommandBuilder, EmbedBuilder, ApplicationCommandOptionType,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType,
  inlineCode, codeBlock,
} = require('discord.js');
const { parseAndRoll } = require('roll-parser');
const SebediusCommand = require('../../structures/command');
const YearZeroRoll = require('../../yearzero/roller/yzroll');
const { YearZeroGames, YearZeroGameNames } = require('../../constants');
const { YearZeroDieTypes } = require('../../yearzero/roller/dice/dice-constants');
const { ArtifactDie, TwilightDie, BladeRunnerDie } = require('../../yearzero/roller/dice');
const { Emojis } = require('../../config');
const { RollError } = require('../../utils/errors');
const Logger = require('../../utils/logger');

/* ------------------------------------------ */
/*  Command Parameters                        */
/*    These can be modified                   */
/* ------------------------------------------ */

/** @enum {string[]} */
const GameSubcommandsList = {
  // [YearZeroGames.BLANK]: [],
  [YearZeroGames.ALIEN_RPG]: ['table', 'reference', 'private'],
  // [YearZeroGames.BLADE_RUNNER]: [],
  // [YearZeroGames.CORIOLIS]: [],
  [YearZeroGames.FORBIDDEN_LANDS]: ['reference', 'lucky', 'private'],
  [YearZeroGames.MUTANT_YEAR_ZERO]: ['table', 'reference', 'private'],
  // [YearZeroGames.TALES_FROM_THE_LOOP]: [],
  // [YearZeroGames.TWILIGHT_2K]: [],
  // [YearZeroGames.VAESEN]: [],
};

/** @enum {SlashCommandOption} */
const SlashCommandOptions = {
  table: {
    description: 'Choose the table',
    type: ApplicationCommandOptionType.String,
    choices: [],
  },
  reference: {
    description: 'Choose a fixed reference',
    type: ApplicationCommandOptionType.Integer,
    min: 11,
    max: 66,
  },
  // title: {
  //   description: 'Define a title for the crit',
  //   type: ApplicationCommandOptionType.String,
  // },
  // modifier: {
  //   description: 'Apply a difficulty modifier of `+X` or `-X` to the roll',
  //   type: ApplicationCommandOptionType.Integer,
  //   min: -20,
  //   max: 20,
  // },
  lucky: {
    description: 'Apply the talent *Lucky*, and choose the rank I, II or III',
    type: ApplicationCommandOptionType.Integer,
    choices: [{
      name: 'Rank I – Roll twice and take the lowest',
      value: 1,
    }, {
      name: 'Rank II – Roll twice and take the lowest inverted',
      value: 2,
    }, {
      name: 'Rank III – Take the first critical injury (#11)',
      value: 3,
    }],
  },
  private: {
    description: 'Whether to hide the result from other players',
    type: ApplicationCommandOptionType.Boolean,
  },
};

/* ------------------------------------------ */
/*  Slash Command Builder                     */
/*    for the Crit Command                    */
/* ------------------------------------------ */

/**
 * Builds the roll slash command, subcommands & options.
 * @returns {SlashCommandBuilder}
 * @private
 */
function _getSlashCommandBuilder() {
  const data = new SlashCommandBuilder()
    .setName('crit')
    .setDescription('Draw a random mutation');

  for (const [game, options] of Object.entries(GameSubcommandsList)) {
    data.addSubcommand(sub => {
      sub.setName(game).setDescription(YearZeroGameNames[game]);
      for (const optionName of options) {
        const option = SlashCommandOptions[optionName];
        if (!option) throw new SyntaxError(`[roll:${game}] Option "${optionName}" Not Found!`);
        switch (option.type) {
          case ApplicationCommandOptionType.String:
            sub.addStringOption(opt => opt
              .setName(optionName)
              .setDescription(option.description)
              .setRequired(!!option.required));
            break;
          case ApplicationCommandOptionType.Integer:
            sub.addIntegerOption(opt => opt
              .setName(optionName)
              .setDescription(option.description)
              .setMinValue(option.min ?? 1)
              .setMaxValue(option.max ?? 100)
              .setRequired(!!option.required));
            break;
          case ApplicationCommandOptionType.Boolean:
            sub.addBooleanOption(opt => opt
              .setName(optionName)
              .setDescription(option.description)
              .setRequired(!!option.required));
            break;
          default: throw new TypeError(`[roll:${game}] Type Not Found for Command Option "${optionName}"!`);
        }
      }
      return sub;
    });
  }
  return data;
}

/* ------------------------------------------ */
/* Roll Command                               */
/* ------------------------------------------ */

module.exports = class RollCommand extends SebediusCommand {
  constructor(client) {
    super(client, {
      category: SebediusCommand.CategoryFlagsBits.ROLL,
      data: _getSlashCommandBuilder(),
    });
  }
  /** @type {SebediusCommand.SebediusCommandRunFunction} */
  async run(interaction, t) {
    const game = interaction.options.getSubcommand();
    const title = interaction.options.getString('title');

    const dice = interaction.options.getInteger('dice');
    const base = interaction.options.getInteger('base');
    const skill = interaction.options.getInteger('skill');
    const gear = interaction.options.getInteger('gear');
    const stress = interaction.options.getInteger('stress');
    const ammo = interaction.options.getInteger('ammo');

    const modifier = interaction.options.getInteger('modifier');
    const maxPush = interaction.options.getInteger('maxpush');

    const artosInput = interaction.options.getString('artifacts');
  }
};

/* ------------------------------------------ */
/*  Type Definitions                          */
/* ------------------------------------------ */

/**
 * @typedef {Object} SlashCommandOption
 * @property {string}   description
 * @property {number}   type
 * @property {boolean} [required=false]
 * @property {number}  [min]
 * @property {number}  [max]
 * @property {{ name: string, value: string|number }[]} [choices]
 */
