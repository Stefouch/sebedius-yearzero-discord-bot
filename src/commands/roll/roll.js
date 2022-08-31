const {
  SlashCommandBuilder, EmbedBuilder,
  inlineCode, codeBlock,
  ActionRowBuilder, ButtonBuilder,
} = require('discord.js');
const SebediusCommand = require('../../structures/command');
const YearZeroRoll = require('../../yearzero/roller/yzroll');
const { YearZeroGames, YearZeroGameNames } = require('../../constants');
const { YearZeroDieTypes } = require('../../yearzero/roller/dice/dice-constants');
const { ArtifactDie, TwilightDie, BladeRunnerDie } = require('../../yearzero/roller/dice');
const Logger = require('../../utils/logger');

/* ------------------------------------------ */
/*  Command Parameters                        */
/*    These can be modified                   */
/* ------------------------------------------ */

/** @enum {string[]} */
const GameSubcommandsList = {
  [YearZeroGames.BLANK]: ['input', 'title', 'private'],
  [YearZeroGames.ALIEN_RPG]: [
    'dice', 'stress', 'title', 'modifier', 'maxpush', 'private', 'fullauto', 'nerves', 'minpanic',
  ],
  [YearZeroGames.BLADE_RUNNER]: ['input', 'title', 'modifier', 'maxpush', 'private'],
  [YearZeroGames.CORIOLIS]: ['dice', 'title', 'modifier', 'maxpush', 'private', 'fullauto'],
  [YearZeroGames.FORBIDDEN_LANDS]: [
    'base', 'skill', 'gear', 'artifacts', 'title', 'modifier', 'maxpush', 'private', 'fullauto', 'pride',
  ],
  [YearZeroGames.MUTANT_YEAR_ZERO]: ['base', 'skill', 'gear', 'artifacts', 'title', 'modifier', 'maxpush', 'private'],
  [YearZeroGames.TALES_FROM_THE_LOOP]: ['dice', 'title', 'modifier', 'maxpush', 'private'],
  [YearZeroGames.TWILIGHT_2K]: ['input', 'ammo', 'title', 'modifier', 'maxpush', 'private', 'fullauto'],
  [YearZeroGames.VAESEN]: ['dice', 'title', 'modifier', 'maxpush', 'private'],
};

/** @enum {SlashCommandOption} */
const SlashCommandOptions = {
  input: {
    description: 'A roll resolvable string for the dice to roll',
    type: 'string',
    required: true,
  },
  dice: {
    description: 'Dice to roll',
    type: 'number',
    required: true,
  },
  base: {
    description: 'Quantity of Base dice',
    type: 'number',
    required: true,
  },
  skill: {
    description: 'Quantity of Skill dice',
    type: 'number',
  },
  gear: {
    description: 'Quantity of Gear dice',
    type: 'number',
  },
  stress: {
    description: 'Quantity of Stress dice',
    type: 'number',
  },
  ammo: {
    description: 'Quantity of Ammunition dice',
    type: 'number',
  },
  artifacts: {
    description: 'A roll resolvable string to add a number of artifact dice',
    type: 'string',
  },
  title: {
    description: 'Define a title for the roll',
    type: 'string',
  },
  modifier: {
    description: 'Apply a difficulty modifier of `+X` or `-X` to the roll',
    type: 'number',
  },
  maxpush: {
    description: 'Change the maximum number of allowed pushes',
    type: 'number',
  },
  private: {
    description: 'Whether to hide the roll from other players',
    type: 'boolean',
  },
  fullauto: {
    description: 'Full-automatic fire: unlimited number of pushes (actually, max 10)',
    type: 'boolean',
  },
  pride: {
    description: 'Add a D12 Artifact Die to the roll',
    type: 'boolean',
  },
  nerves: {
    description: 'Apply the talent *Nerves of Steel*',
    type: 'boolean',
  },
  minpanic: {
    description: 'Adjusts a minimum treshold for multiple consecutive panic effects',
    type: 'number',
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
        const option = SlashCommandOptions[optionName];
        if (!option) throw new SyntaxError(`[roll:${game}] Option "${optionName}" Not Found!`);
        switch (option.type) {
          case 'string':
            sub.addStringOption(opt => opt
              .setName(optionName)
              .setDescription(option.description)
              .setRequired(!!option.required));
            break;
          case 'number':
            sub.addNumberOption(opt => opt
              .setName(optionName)
              .setDescription(option.description)
              .setRequired(!!option.required));
            break;
          case 'boolean':
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

    const input = interaction.options.getString('input');
    const artosInput = interaction.options.getString('artifacts');

    const dice = interaction.options.getNumber('dice');
    const base = interaction.options.getNumber('base');
    const skill = interaction.options.getNumber('skill');
    const gear = interaction.options.getNumber('gear');
    const stress = interaction.options.getNumber('stress');
    const ammo = interaction.options.getNumber('ammo');
    const modifier = interaction.options.getNumber('modifier');

    // Generic rolls are parsed by another library.
    if (game === YearZeroGames.BLANK) {
      // TODO return this.renderGeneric(diceString, title);
    }

    // Creates the roll.
    const roll = new YearZeroRoll({
      game,
      name: title, // If title is empty, it'll be fixed in render().
      author: interaction.member,
    });

    // Parses roll string input (for Twilight 2000 & Blade Runner).
    if (input) {
      const Die = game === YearZeroGames.TWILIGHT_2K ? TwilightDie : BladeRunnerDie;

      const inputRegex = /(?:(\d+)?d?(6|8|10|12))|([abcd])/g;
      let result;
      // https://stackoverflow.com/a/27753327
      while ((result = inputRegex.exec(input)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (result.index === inputRegex.lastIndex) inputRegex.lastIndex++;

        // $0 = whole match
        // $1 = qty, digit before "d"
        // $2 = faces, digit after "d"
        // $3 = letter
        const n = +result[1] || 1;
        const d = result[2] || result[3];
        switch (d) {
          case '6': case 'd': roll.addDice(Die, n, { faces: 6 }); break;
          case '8': case 'c': roll.addDice(Die, n, { faces: 8 }); break;
          case '10': case 'b': roll.addDice(Die, n, { faces: 10 }); break;
          case '12': case 'a': roll.addDice(Die, n, { faces: 12 }); break;
          default: Logger.warn(`Roll Builder | Unknown roll string: "${d}"`);
        }
      }
    }

    // Parses everything else.
    if (dice) roll.addSkillDice(dice);
    if (base) roll.addBaseDice(base);
    if (skill) roll.addSkillDice(skill);
    if (gear) roll.addGearDice(gear);
    if (stress) roll.addStressDice(stress);
    if (ammo) roll.addAmmoDice(ammo);

    // Parses artifact roll string input.
    if (artosInput) {
      const artoRegex = /\d+/g;
      let result;
      // https://stackoverflow.com/a/27753327
      while ((result = artoRegex.exec(artosInput)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (result.index === artoRegex.lastIndex) artoRegex.lastIndex++;
        roll.addDice(ArtifactDie, 1, { faces: +result[0] });
      }
    }

    // FBL Pride
    if (interaction.options.getBoolean('pride')) {
      roll.addDice(ArtifactDie, 1, { faces: 12 });
    }

    // Adds the modifier, if any.
    if (modifier) roll.modify(modifier);

    return this.render(roll, interaction, t);
  }

  /* ------------------------------------------ */
  /*  Support Methods                           */
  /* ------------------------------------------ */

  /**
   * Renders the results of the roll into a chat message.
   * @param {YearZeroRoll} roll
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   * @param {SebediusCommand.SebediusTranslationCallback} t
   */
  async render(roll, interaction, t) {
    /** @type {import('$config').DiceRenderOptions} */
    const options = this.bot.config.Commands.roll.options[roll.game];
    if (!options) throw new ReferenceError(`[roll:${roll.game}] Command Options Not Found!`);

    if (roll.size < 1) {
      throw new Error(t('commands:help.noDiceError'));
    }

    if (roll.size > this.bot.config.Commands.roll.max) {
      throw new Error(t('commands:roll.tooManyDiceError'));
    }

    // Rolls the dice.
    if (!roll.rolled) await roll.roll();

    // Fixes the name.
    if (!roll.name) roll.name = inlineCode(roll.toPool());

    // Builds the embed.
    const embed = new EmbedBuilder()
      .setTitle(roll.name + (roll.pushed ? '⁺'.repeat(roll.pushCount) : ''))
      .setColor(this.bot.config.favoriteColor)
      .setDescription(this.#getRollDescription(roll, t, options))
      .setTimestamp()
      .setFooter({
        text: YearZeroGameNames[roll.game]
          + (roll.pushed ? ` • ${t('commands:roll.embed.pushed', { count: roll.pushCount })}` : ''),
      });

    if (options.detailed) {
      embed.addFields({
        name: t('commands:roll.embed.details'),
        value: this.#getRollDetails(roll),
      });
    }

    // Sends the reply.
    return interaction.reply({
      content: roll.emojify(options.template),
      embeds: [embed],
      ephemeral: interaction.options.getBoolean('private'),
      fetchReply: true,
    });
  }

  /* ------------------------------------------ */
  /*  Utils Methods                             */
  /* ------------------------------------------ */

  /**
   * @param {YearZeroRoll} roll
   * @param {SebediusCommand.SebediusTranslationCallback} t
   * @param {import('$config').DiceRenderOptions} options
   * @returns {string}
   */
  #getRollDescription(roll, t, options) {
    const out = [];
    const s = roll.successCount;

    out.push(t('commands:roll.embed.success', { count: s }));

    // Traumas
    if (options.trauma) {
      const n = roll.attributeTrauma;
      out.push(t('commands:roll.embed.trauma', { count: n }));
    }

    // Gear Damage
    if (options.gearDamage) {
      out.push(t('commands:roll.embed.gearDamage', { count: roll.gearDamage }));
    }

    // Twilight 2000
    if (roll.game === YearZeroGames.TWILIGHT_2K) {
      // Rate of Fire
      if (roll.rof) {
        const n = roll.countDice(YearZeroDieTypes.AMMO, 6);
        if (n > 0) {
          if (s > 0) out.push(t('commands:roll.embed.extraHit', { count: n }));
          else out.push(t('commands:roll.embed.suppression', { count: n }));
        }
      }

      // Pushed Traumas
      if (roll.pushed && roll.baneCount > 0) {
        const b = roll.attributeTrauma;
        if (b > 0) out.push(t('commands:roll.embed.damageOrStress', { count: b }));
        const j = roll.jamCount;
        if (j > 0) out.push(t('commands:roll.embed.reliability', { count: j }));
        if (roll.jammed) out.push(t('commands:roll.embed.weaponJam'));
      }
    }

    // Panic (Alien RPG)
    if (options.panic && roll.panic) {
      out.push(t('commands:roll.embed.panic'));
    }

    return out.join('\n');
  }

  /* ------------------------------------------ */

  /**
   * @param {YearZeroRoll} roll
   * @returns {string}
   */
  #getRollDetails(roll) {
    const out = [];
    for(const [typeName, type] of Object.entries(YearZeroDieTypes)) {
      const dice = roll.getDice(type);
      if (dice.length) {
        const diceResults = dice.map(d => d.result);
        out.push(` → [${typeName.toLowerCase()}]: ${diceResults.join(', ')}`);
      }
    }
    if (roll.pushed) {
      for (const [typeName, type] of Object.entries(YearZeroDieTypes)) {
        const rpc = roll.pushCount;
        const dice = roll.getDice(type);
        for (let p = rpc; p > 0; p--) {
          const diceResults = dice
            .filter(d => rpc - d.pushCount < p)
            .map(d => d.results.at(d.pushCount - (rpc - p) - 1));
          out.push(`#${p} [${typeName.toLowerCase()}]: ${diceResults.join(', ')}`);
        }
      }
    }
    return codeBlock('php', out.join('\n'));
  }
};

/* ------------------------------------------ */
/*  Type Definitions                          */
/* ------------------------------------------ */

/**
 * @typedef {Object} SlashCommandOption
 * @property {string}   description
 * @property {string}   type
 * @property {boolean} [required=false]
 */
