const {
  SlashCommandBuilder, EmbedBuilder, ApplicationCommandOptionType,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType,
  inlineCode, codeBlock,
} = require('discord.js');
const SebediusCommand = require('../../structures/command');
const YearZeroRoll = require('../../yearzero/roller/yzroll');
const YearZeroCrit = require('../../yearzero/crit/yzcrit');
const { YearZeroGames, YearZeroRollTables } = require('../../constants');
const { BaseDie } = require('../../yearzero/roller/dice');
const { clamp } = require('../../utils/number-utils');

/* ------------------------------------------ */
/*  Command Parameters                        */
/*    These can be modified                   */
/* ------------------------------------------ */

/** @enum {string[]} */
const GameSubcommandsList = {
  // [YearZeroGames.BLANK]: [],
  [YearZeroGames.ALIEN_RPG]: [`table_${YearZeroGames.ALIEN_RPG}`, 'reference', 'private'],
  // [YearZeroGames.BLADE_RUNNER]: [],
  // [YearZeroGames.CORIOLIS]: [],
  [YearZeroGames.FORBIDDEN_LANDS]: [`table_${YearZeroGames.FORBIDDEN_LANDS}`, 'reference', 'lucky', 'private'],
  [YearZeroGames.MUTANT_YEAR_ZERO]: [`table_${YearZeroGames.MUTANT_YEAR_ZERO}`, 'reference', 'private'],
  // [YearZeroGames.TALES_FROM_THE_LOOP]: [],
  // [YearZeroGames.TWILIGHT_2K]: [],
  // [YearZeroGames.VAESEN]: [],
};

/** @enum {SebediusCommand.SlashCommandOption} */
const SlashCommandOptions = {
  [`table_${YearZeroGames.ALIEN_RPG}`]: {
    description: 'Choose the table',
    type: ApplicationCommandOptionType.String,
    choices: [{
      name: 'Damage',
      value: YearZeroRollTables.ALIEN_CRIT_DAMAGE,
    }, {
      name: 'Mental',
      value: YearZeroRollTables.ALIEN_CRIT_MENTAL,
    }, {
      name: 'Synthetic',
      value: YearZeroRollTables.ALIEN_CRIT_SYNTHETIC,
    }, {
      name: 'Xeno',
      value: YearZeroRollTables.ALIEN_CRIT_XENO,
    }],
  },
  [`table_${YearZeroGames.FORBIDDEN_LANDS}`]: {
    description: 'Choose the table',
    type: ApplicationCommandOptionType.String,
    choices: [{
      name: 'Slash',
      value: YearZeroRollTables.FBL_CRIT_SLASH,
    }, {
      name: 'Blunt',
      value: YearZeroRollTables.FBL_CRIT_BLUNT,
    }, {
      name: 'Stab',
      value: YearZeroRollTables.FBL_CRIT_STAB,
    }, {
      name: 'Horror',
      value: YearZeroRollTables.FBL_CRIT_HORROR,
    }],
  },
  [`table_${YearZeroGames.MUTANT_YEAR_ZERO}`]: {
    description: 'Choose the table',
    type: ApplicationCommandOptionType.String,
    choices: [{
      name: 'Damage',
      value: YearZeroRollTables.MYZ_CRIT_DAMAGE,
    }, {
      name: 'Horror',
      value: YearZeroRollTables.FBL_CRIT_HORROR,
    }],
  },
  reference: {
    description: 'Choose a fixed reference',
    type: ApplicationCommandOptionType.Integer,
    min: 11,
    max: 66,
  },
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
      data: null,
    });
    this.data = this.createSlashCommandBuilder(
      'crit',
      'Draw a random critical injury',
      GameSubcommandsList,
      SlashCommandOptions,
    );
  }
  /** @type {SebediusCommand.SebediusCommandRunFunction} */
  async run(interaction, t) {
    const game = interaction.options.getSubcommand();
    const fixedReference = interaction.options.getInteger('reference');
    const luckyRank = interaction.options.getInteger('lucky');
    const tableName = interaction.options.getString(`table_${game}`);

    return this.crit(interaction, t, {
      game, tableName, fixedReference, luckyRank,
    });

  }

  /**
   * @param {SebediusCommand.SebediusCommandInteraction}  interaction
   * @param {SebediusCommand.SebediusTranslationCallback} t
   * @param {Object}        args
   * @param {YearZeroGames} args.game
   * @param {string}        args.tableName
   * @param {number}        args.fixedReference
   * @param {number}        args.luckyRank
   */
  async crit(interaction, t, { game, tableName, fixedReference, luckyRank }) {
    // If the tableName was not found, takes the first table of the game.
    if (!tableName) {
      tableName = Object.values(YearZeroRollTables)
        .find(rt => rt.startsWith(`table-${game}`));
    }
    if (!tableName) {
      throw new ReferenceError(`[crit:${game}] Table Name Not Found!`);
    }

    // Loads the crit table.
    const critTable = await this.bot.getTable(t.lng, tableName);
    if (!critTable) {
      throw new ReferenceError(`[crit:${game}] Table "${tableName}" Not Found!`);
    }

    // Makes a roll for the crit.
    const critRoll = new YearZeroRoll({
      author: interaction.member,
      name: 'Crit Roll',
      game,
    }).setMaxPush(0);

    let value = 0;

    if (fixedReference) {
      value = +[...String(fixedReference)]
        .map(v => clamp(Number(v), 1, 6))
        .join('');
    }
    else if (luckyRank) {
      const luckyResult = this.#lucky(luckyRank);
      value = luckyResult.value;
    }
    else {
      value = rollD66();
    }

    // Adds the dice.
    [...String(value)].forEach(d =>
      critRoll.addDice(BaseDie, 1, { results: [Number(d)] }),
    );

    // Gets the crit.
    const critData = critTable.get(value, true);
    const crit = new YearZeroCrit(critData);

    return interaction.reply({
      content: critRoll.emojify(),
      embeds: [this.#getCritEmbed(crit)],
      ephemeral: interaction.options.getBoolean('private', false),
    });
  }

  /* ------------------------------------------ */

  /**
   * @param {number} rank
   */
  #lucky(rank) {
    const result = {
      /** @type {number[]} */ values: [],
      get value() { return Math.min(...this.values); },
    };

    switch (rank) {
      case 1:
        result.values = [rollD66(), rollD66()];
        break;
      case 2:
        result.values = [rollD66(), rollD66()].map(v => +[...String(v)].reverse().join(''));
        break;
      case 3:
        result.values = [11];
        break;
    }
    return result;
  }

  /* ------------------------------------------ */

  /**
   * @param {YearZeroCrit} crit 
   */
  #getCritEmbed(crit) {
    const embed = new EmbedBuilder()
      .setTitle();
    return embed;
  }

};

function rollD66() {
  return BaseDie.rng(1, 6) * 10 + BaseDie.rng(1, 6);
}
