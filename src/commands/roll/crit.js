const { EmbedBuilder, ApplicationCommandOptionType, bold } = require('discord.js');
const SebediusCommand = require('../../structures/command');
const YearZeroRoll = require('../../yearzero/roller/yzroll');
const YearZeroCrit = require('../../yearzero/crit/yzcrit');
const { YearZeroGames, YearZeroRollTables } = require('../../constants');
const { BaseDie, BladeRunnerDie, TwilightDie } = require('../../yearzero/roller/dice');
const { clamp } = require('../../utils/number-utils');

/* ------------------------------------------ */
/*  Command Parameters                        */
/*    These can be modified                   */
/* ------------------------------------------ */

/** @enum {string[]} */
const GameSubcommandsList = {
  // [YearZeroGames.BLANK]: [],
  [YearZeroGames.ALIEN_RPG]: [`table_${YearZeroGames.ALIEN_RPG}`, 'reference', 'private'],
  [YearZeroGames.BLADE_RUNNER]: [`table_${YearZeroGames.BLADE_RUNNER}`, 'reference', 'private'],
  [YearZeroGames.CORIOLIS]: ['reference', 'private'],
  [YearZeroGames.FORBIDDEN_LANDS]: [`table_${YearZeroGames.FORBIDDEN_LANDS}`, 'reference', 'lucky', 'private'],
  [YearZeroGames.MUTANT_YEAR_ZERO]: [`table_${YearZeroGames.MUTANT_YEAR_ZERO}`, 'reference', 'private'],
  // [YearZeroGames.TALES_FROM_THE_LOOP]: [],
  [YearZeroGames.TWILIGHT_2K]: [`table_${YearZeroGames.TWILIGHT_2K}`, 'reference', 'private'],
  [YearZeroGames.VAESEN]: [`table_${YearZeroGames.VAESEN}`, 'reference', 'private'],
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
  [`table_${YearZeroGames.BLADE_RUNNER}`]: {
    description: 'Choose the table',
    type: ApplicationCommandOptionType.String,
    choices: [{
      name: 'Piercing',
      value: YearZeroRollTables.BLADERUNNER_CRIT_PIERCING,
    }, {
      name: 'Crushing',
      value: YearZeroRollTables.BLADERUNNER_CRIT_CRUSHING,
    }, {
      name: 'Critical Stress Effect',
      value: YearZeroRollTables.BLADERUNNER_CRIT_MENTAL,
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
  [`table_${YearZeroGames.TWILIGHT_2K}`]: {
    description: 'Choose the table',
    type: ApplicationCommandOptionType.String,
    choices: [{
      name: 'Head',
      value: YearZeroRollTables.T2K_CRIT_HEAD,
    }, {
      name: 'Arms',
      value: YearZeroRollTables.T2K_CRIT_ARMS,
    }, {
      name: 'Torso',
      value: YearZeroRollTables.T2K_CRIT_TORSO,
    }, {
      name: 'Legs',
      value: YearZeroRollTables.T2K_CRIT_LEGS,
    }, {
      name: 'Mental',
      value: YearZeroRollTables.T2K_CRIT_MENTAL,
    }],
  },
  [`table_${YearZeroGames.VAESEN}`]: {
    description: 'Choose the table',
    type: ApplicationCommandOptionType.String,
    choices: [{
      name: 'Damage',
      value: YearZeroRollTables.VAESEN_CRIT_DAMAGE,
    }, {
      name: 'Mental',
      value: YearZeroRollTables.VAESEN_CRIT_MENTAL,
    }],
  },
  reference: {
    description: 'Choose a fixed reference',
    type: ApplicationCommandOptionType.Integer,
    min: 1,
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

    // await interaction.deferReply({
    //   ephemeral: interaction.options.getBoolean('private'),
    // });

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

    const max = critTable.max;

    // Makes a roll for the crit.
    const critRoll = new YearZeroRoll({
      author: interaction.member,
      name: 'Crit Roll',
      game,
    });

    let value = 0, values;

    // Classic games:
    if ([66, 666].includes(max)) {
      if (fixedReference) {
        value = +[...String(fixedReference)]
          .map(v => clamp(Number(v), 1, 6))
          .join('');
      }
      else if (luckyRank) {
        const luckyResult = this.#lucky(luckyRank);
        value = luckyResult.value;
        values = luckyResult.values;
      }
      else {
        value = rollD66();
      }
    }
    // Twilight 2000 & Blade Runner:
    else if (fixedReference) value = clamp(fixedReference, 1, max);
    else value = BaseDie.rng(1, max);

    // Adds the dice.
    switch (game) {
      case YearZeroGames.BLADE_RUNNER:
        critRoll.addDice(BladeRunnerDie, 1, { faces: max, results: [value] });
        break;
      case YearZeroGames.TWILIGHT_2K:
        critRoll.addDice(TwilightDie, 1, { faces: max, results: [value] });
        break;
      default:
        [...String(value)].forEach(d =>
          critRoll.addDice(BaseDie, 1, { results: [Number(d)] }),
        );
    }

    critRoll.setMaxPush(0);

    // Gets the crit.
    const critData = critTable.get(value, true) || {};
    critData.ref = value;
    critData.game = game;
    if (values) critData.rolledResults = values;

    const crit = new YearZeroCrit(critData);

    const embed = await this.#createCritEmbed(crit, t);
    embed.setFooter({ text: `D${max} • ${tableName}` });

    // If the game has blank dice, we should use the default template.
    const hasBlankDice = this.bot.config.Commands.roll.options[game]?.hasBlankDice;

    return interaction.reply({
      content: critRoll.emojify(hasBlankDice ? YearZeroGames.BLANK : game),
      embeds: [embed],
      // ephemeral: interaction.options.getBoolean('private', false),
    })
      .then(() => {
        if (crit.fatal && game !== YearZeroGames.VAESEN) {
          // Sends a coffin emoji.
          setTimeout(() => interaction.followUp('⚰️'), rollD66() * 150);
        }
      })
      .catch(console.error);
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
      // Rank I: Roll twice, take the lowest.
      case 1:
        result.values = [rollD66(), rollD66()];
        break;
      // Rank II: Roll twice, reverse the values, then take the lowest.
      case 2:
        result.values = [rollD66(), rollD66()].map(v => +[...String(v)].reverse().join(''));
        break;
      // Rank III: Choose whichever you want.
      case 3:
        result.values = [11];
        break;
    }
    return result;
  }

  /* ------------------------------------------ */

  /**
   * Creates an embed for the critical injury.
   * @param {YearZeroCrit} crit
   * @param {SebediusCommand.SebediusTranslationCallback} t
   */
  async #createCritEmbed(crit, t) {
    const embed = new EmbedBuilder()
      .setTitle(`${crit.ref} → **${crit.name}**`)
      .setDescription(await this.bot.enricher.enrichText(crit.effect));

    if (crit.healingTime.value !== 0 || crit.healingTime.text) {
      let name, value;
      // -1 means permanent effect.
      if (crit.healingTime.value === -1) {
        name = t('commands:crit.embed.permanent');
        value = t('commands:crit.embed.permanentEffects');
      }
      else {
        if (
          typeof crit.healingTime.text !== 'undefined' &&
          typeof crit.healingTime.value === 'undefined'
        ) {
          crit.healingTime.value = Number(await this.bot.enricher.enrichText(
            crit.healingTime.text,
            { onlyNumber: true },
          ));
        }
        name = t('commands:crit.embed.healingTime');
        value = t('commands:crit.embed.healingTimeDescription', {
          count: crit.healingTime.value,
          text: crit.healingTime.text ?? crit.healingTime.value,
        });
      }
      embed.addFields({ name, value });
    }

    if (crit.lethal) {
      let value;
      if (crit.timeLimit || crit.game === YearZeroGames.VAESEN) {
        value = t('commands:crit.embed.lethalityDescription', {
          modifier: crit.healMalus ? `(${t('commands:crit.embed.modifiedBy', { mod: crit.healMalus })})` : ' ',
          time: bold(t('commands:crit.embed.timeLimit', {
            count: crit.timeLimit,
            unit: crit.timeLimitUnit,
          })),
        });
      }
      else {
        value = '💀💀💀';
      }
      embed.addFields({ name: t('commands:crit.embed.lethality'), value });
    }

    if (crit.lucky) {
      embed.addFields({
        name: t('commons:talents.fbl.lucky'),
        value: t('commands:crit.embed.lucky', { values: crit.rolledResults }),
      });
    }

    // Sets the color.
    if (crit.lethal) {
      embed.setColor(crit.fatal ? this.bot.config.Colors.isoProhibit : this.bot.config.Colors.red);
    }
    // else if (crit.ref < ) {
    //   embed.setColor(this.bot.config.Colors.isoWarn);
    // } // TODO

    return embed;
  }

};

/**
 * Rolls a D66 and returns the result.
 * @returns {number}
 */
function rollD66() {
  return BaseDie.rng(1, 6) * 10 + BaseDie.rng(1, 6);
}
