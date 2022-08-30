const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const SebediusCommand = require('../../structures/command');
const YearZeroRoll = require('../../yearzero/roller/yzroll');
const { YearZeroGames, YearZeroGameNames } = require('../../constants');

/* ------------------------------------------ */
/*  Command Parameters                        */
/*    These can be modified                   */
/* ------------------------------------------ */

/** @enum {string[]} */
const GameSubcommandsList = {
  [YearZeroGames.BLANK]: ['dice', 'title', 'private'],
  [YearZeroGames.ALIEN_RPG]: ['dice', 'title', 'modifier', 'maxpush', 'private', 'fullauto', 'nerves', 'minpanic'],
  [YearZeroGames.BLADE_RUNNER]: ['dice', 'title', 'modifier', 'maxpush', 'private'],
  [YearZeroGames.CORIOLIS]: ['dice', 'title', 'modifier', 'maxpush', 'private', 'fullauto'],
  [YearZeroGames.FORBIDDEN_LANDS]: ['dice', 'title', 'modifier', 'maxpush', 'private', 'fullauto', 'pride'],
  [YearZeroGames.MUTANT_YEAR_ZERO]: ['dice', 'title', 'modifier', 'maxpush', 'private'],
  [YearZeroGames.TALES_FROM_THE_LOOP]: ['dice', 'title', 'modifier', 'maxpush', 'private'],
  [YearZeroGames.TWILIGHT_2K]: ['dice', 'title', 'modifier', 'maxpush', 'private', 'fullauto'],
  [YearZeroGames.VAESEN]: ['dice', 'title', 'modifier', 'maxpush', 'private'],
};

/** @enum {CommandOption} */
const CommandOptions = {
  // TODO remove
  // game: {
  //   description: 'Override the default chosen game which is used to render the rolled dice',
  //   type: String,
  //   choices: [],
  // },
  dice: {
    description: 'Dice to roll',
    type: String,
    required: true,
  },
  title: {
    description: 'Define a title for the roll',
    type: String,
  },
  modifier: {
    description: 'Apply a difficulty modifier of `+X` or `-X` to the roll',
    type: Number,
  },
  maxpush: {
    description: 'Change the maximum number of allowed pushes',
    type: Number,
  },
  private: {
    description: 'Hide the roll from other players',
    type: Boolean,
  },
  fullauto: {
    description: 'Full-automatic fire: unlimited number of pushes (max 10)',
    type: Boolean,
  },
  pride: {
    description: 'Add a D12 Artifact Die to the roll',
    type: Boolean,
  },
  nerves: {
    description: 'Apply the talent *Nerves of Steel*',
    type: Boolean,
  },
  minpanic: {
    description: 'Adjusts a minimum treshold for multiple consecutive panic effects',
    type: Number,
  },
};

/* ------------------------------------------ */
/*  Slash Command Builder                     */
/*    for the Roll Command                    */
/* ------------------------------------------ */

/**
 * Builds the roll slash command, subcommands & options.
 * @returns {SlashCommandBuilder}
 * @private
 */
function _getSlashCommandBuilder() {
  const data = new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Roll dice for any Year Zero roleplaying game');

  for (const [game, options] of Object.entries(GameSubcommandsList)) {
    data.addSubcommand(sub => {
      sub.setName(game).setDescription(YearZeroGameNames[game]);
      for (const optionName of options) {
        const option = CommandOptions[optionName];
        if (!option) throw new SyntaxError(`[Roll::${game}] Option "${optionName}" Not Found!`);
        switch (option.type) {
          case String:
            sub.addStringOption(opt => opt
              .setName(optionName)
              .setDescription(option.description)
              .setRequired(!!option.required));
            break;
          case Number:
            sub.addNumberOption(opt => opt
              .setName(optionName)
              .setDescription(option.description)
              .setRequired(!!option.required));
            break;
          case Boolean:
            sub.addBooleanOption(opt => opt
              .setName(optionName)
              .setDescription(option.description)
              .setRequired(!!option.required));
            break;
          default: throw new TypeError(`[Roll::${game}] Type Not Found for Command Option "${optionName}"!`);
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
  /**
   * The roll.
   * @type {YearZeroRoll}
   */
  roll;

  constructor(client) {
    super(client, {
      category: SebediusCommand.CategoryFlagsBits.ROLL,
      data: _getSlashCommandBuilder(),
    });
  }
  /** @type {SebediusCommand.SebediusCommandRunFunction} */
  async run(interaction, t) {
    // Gets the game.
    const game = interaction.options.getSubcommand();

    // Gets the dice.
    const diceString = interaction.options.getString('dice').toLowerCase();

    // Creates the roll.
    this.roll = new YearZeroRoll({
      game,
      name: interaction.options.getString('title'),
      author: interaction.member,
    });

    // Checks for d6, d66 & d666.
    const isD66 = /^d6{1,3}$/i.test(diceString);
    if (isD66) return this.replyD66Roll(interaction, t, diceString);
  }

  /* ------------------------------------------ */
  /*  Support Methods                           */
  /* ------------------------------------------ */

  replyD66Roll(interaction, t, diceString) {
    const n = diceString.split('6').length - 1; // Counts the number of "6" in the dice string.
    this.roll.addSkillDice(n);
    return this.render(interaction, t, { isD66: true });
  }

  /* ------------------------------------------ */

  /**
   * Renders the results of the roll into a chat message.
   * @param {SebediusCommand.SebediusCommandInteraction} interaction
   * @param {SebediusCommand.SebediusTranslationCallback} t
   * @param {Object}  [options] 
   * @param {boolean} [options.isPrivate=false]
   * @param {boolean} [options.isD66=false]
   */
  async render(interaction, t, { isPrivate = false, isD66 = false } = {}) {
    if (!this.roll.rolled) await this.roll.roll();
    const embed = new EmbedBuilder()
      .setTitle(this.roll.name)
      .setColor(this.bot.config.favoriteColor)
      .setTimestamp();

    if (isD66) {
      embed.setDescription(t('commands:roll.result.d66', {
        result: '' + this.roll.sumProductBaseTen(),
      }));
    }

    return interaction.reply({
      content: this.roll.emojifyRoll(),
      embeds: [embed],
    });
  }
};

/* ------------------------------------------ */
/*  Type Definitions                          */
/* ------------------------------------------ */

/**
 * @typedef {Object} CommandOption
 * @property {string}   description
 * @property {any}      type
 * @property {boolean} [required=false]
 */
