const {
  SlashCommandBuilder, EmbedBuilder, ApplicationCommandOptionType,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType,
  inlineCode, codeBlock,
} = require('discord.js');
const SebediusCommand = require('../../structures/command');
const YearZeroRoll = require('../../yearzero/roller/yzroll');
const { YearZeroGames, YearZeroGameNames } = require('../../constants');
const { YearZeroDieTypes } = require('../../yearzero/roller/dice/dice-constants');
const { Emojis } = require('../../config');
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

/** @enum {SebediusCommand.SlashCommandOption} */
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
/* Roll Command                               */
/* ------------------------------------------ */

module.exports = class CritCommand extends SebediusCommand {
  constructor(client) {
    super(client, {
      ownerOnly: true,
      category: SebediusCommand.CategoryFlagsBits.ROLL,
      data: SebediusCommand.createSlashCommandBuilder(
        'crit',
        'Draw a random critical injury',
        GameSubcommandsList,
        SlashCommandOptions,
      ),
    });
  }
  /** @type {SebediusCommand.SebediusCommandRunFunction} */
  async run(interaction, t) {
    const game = interaction.options.getSubcommand();
    // const title = interaction.options.getString('title');
  }
};
