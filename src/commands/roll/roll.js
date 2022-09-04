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
  [YearZeroGames.BLANK]: ['input', 'title', 'private'],
  [YearZeroGames.ALIEN_RPG]: [
    'dice', 'stress', 'title', 'modifier', 'maxpush', 'fullauto', 'private', 'nerves', 'minpanic',
  ],
  [YearZeroGames.BLADE_RUNNER]: ['abcd', 'title', 'modifier', 'maxpush', 'private'],
  [YearZeroGames.CORIOLIS]: ['dice', 'title', 'modifier', 'maxpush', 'fullauto', 'private'],
  [YearZeroGames.FORBIDDEN_LANDS]: [
    'base', 'skill', 'gear', 'artifacts', 'title', 'modifier', 'maxpush', 'private', 'pride',
  ],
  [YearZeroGames.MUTANT_YEAR_ZERO]: [
    'base', 'skill', 'gear', 'artifacts', 'title', 'modifier', 'maxpush', 'fullauto', 'private',
  ],
  [YearZeroGames.TALES_FROM_THE_LOOP]: ['dice', 'title', 'modifier', 'maxpush', 'private'],
  [YearZeroGames.TWILIGHT_2K]: ['abcd', 'ammo', 'title', 'modifier', 'maxpush', 'fullauto', 'private'],
  [YearZeroGames.VAESEN]: ['dice', 'title', 'modifier', 'maxpush', 'private'],
};

/** @enum {SlashCommandOption} */
const SlashCommandOptions = {
  input: {
    description: 'A roll string for the dice to roll in the format NdX!>XfX (separate multiple rolls with a space)',
    type: ApplicationCommandOptionType.String,
    required: true,
  },
  abcd: {
    description: 'Type any of the following: 12, 10, 8, 6, a, b, c, d',
    type: ApplicationCommandOptionType.String,
    required: true,
  },
  dice: {
    description: 'Number of dice to roll',
    type: ApplicationCommandOptionType.Integer,
    required: true,
    min: 1,
  },
  base: {
    description: 'Quantity of Base dice',
    type: ApplicationCommandOptionType.Integer,
    required: true,
    min: 1,
  },
  skill: {
    description: 'Quantity of Skill dice',
    type: ApplicationCommandOptionType.Integer,
  },
  gear: {
    description: 'Quantity of Gear dice',
    type: ApplicationCommandOptionType.Integer,
    min: 1,
  },
  stress: {
    description: 'Quantity of Stress dice',
    type: ApplicationCommandOptionType.Integer,
    min: 1,
  },
  ammo: {
    description: 'Quantity of Ammunition dice',
    type: ApplicationCommandOptionType.Integer,
    min: 1,
  },
  artifacts: {
    description: 'Add a number of artifact dice: Type `d6`, `d8`, `d10` or `d12`',
    type: ApplicationCommandOptionType.String,
  },
  title: {
    description: 'Define a title for the roll',
    type: ApplicationCommandOptionType.String,
  },
  modifier: {
    description: 'Apply a difficulty modifier of `+X` or `-X` to the roll',
    type: ApplicationCommandOptionType.Integer,
    min: -20,
    max: 20,
  },
  maxpush: {
    description: 'Change the maximum number of allowed pushes (type 0 for no push)',
    type: ApplicationCommandOptionType.Integer,
    min: 0,
    max: 10,
  },
  private: {
    description: 'Whether to hide the roll from other players',
    type: ApplicationCommandOptionType.Boolean,
  },
  fullauto: {
    description: 'Full-automatic fire: unlimited number of pushes (actually, max 10)',
    type: ApplicationCommandOptionType.Boolean,
  },
  pride: {
    description: 'Add a D12 Artifact Die to the roll',
    type: ApplicationCommandOptionType.Boolean,
  },
  nerves: {
    description: 'Apply the talent *Nerves of Steel*',
    type: ApplicationCommandOptionType.Boolean,
  },
  minpanic: {
    description: 'Adjusts a minimum treshold for multiple consecutive panic effects',
    type: ApplicationCommandOptionType.Integer,
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

    // Generic rolls are parsed by another library.
    if (game === YearZeroGames.BLANK) {
      const input = interaction.options.getString('input');
      return this.executeGenericRoll(input, title, interaction, t);
    }

    // Creates the roll.
    const roll = new YearZeroRoll({
      game,
      name: title, // If title is empty, it'll be fixed in render().
      author: interaction.member,
    });

    // Parses roll string input (for Twilight 2000 & Blade Runner).
    if (game === YearZeroGames.TWILIGHT_2K || game === YearZeroGames.BLADE_RUNNER) {
      const input = interaction.options.getString('abcd');
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
        // This is necessary to avoid infinite loops with zero-width matches.
        if (result.index === artoRegex.lastIndex) artoRegex.lastIndex++;
        // Allows only a subset of die faces.
        if (![6, 8, 10, 12].includes(+result[0])) continue;
        // Adds the artifact dice.
        roll.addDice(ArtifactDie, 1, { faces: +result[0] });
      }
    }

    // FBL Pride
    if (interaction.options.getBoolean('pride')) {
      roll.addDice(ArtifactDie, 1, { faces: 12 });
    }

    // Adds the modifier, if any.
    if (modifier) roll.modify(modifier);

    // Sets the maximum number of pushes.
    // Note: Cannot use typeof undefined because null is returned by DiscordJS
    if (maxPush != null) roll.setMaxPush(maxPush);
    else {
      const fullauto = interaction.options.getBoolean('fullauto');
      if (fullauto) roll.setMaxPush(10);
    }

    // Renders the roll to the chat.
    /** @type {import('discord.js').InteractionReplyOptions} */
    const messageData = await this.render(roll, interaction, t);
    await interaction.reply({
      ...messageData,
      ephemeral: interaction.options.getBoolean('private'),
      fetchReply: true,
    });

    if (roll.pushable) await this.awaitPush(roll, interaction, t);
  }

  /* ------------------------------------------ */
  /*  Generic Roll Method                       */
  /* ------------------------------------------ */

  /**
   * Parses & renders a generic roll.
   * @param {string} input
   * @param {string} title
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   * @param {SebediusCommand.SebediusTranslationCallback} t
   */
  async executeGenericRoll(input, title, interaction, t) {
    const roll = parseAndRoll(input);
    Logger.roll(`roll:generic ${roll ? roll.toString() : input}`);

    if (!roll) {
      return interaction.reply({
        ephemeral: true,
        content: `${Emojis.shrug} ${t('commands:roll.genericRollParseError', {
          input: codeBlock(input),
        })}`,
      });
    }

    if (roll.rolls.length > this.bot.config.Commands.roll.max) {
      return interaction.reply({
        content: `${Emojis.warning} ${t('commands:roll.tooManyDiceError')}`,
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(title ?? inlineCode(input))
      .setDescription(`**${roll.value}**`)
      .setColor(this.bot.config.favoriteColor)
      .setTimestamp()
      .setFooter({ text: YearZeroGameNames[YearZeroGames.BLANK] })
      .addFields({
        name: t('commands:roll.embed.details'),
        value: codeBlock(roll.toString()),
      });

    return interaction.reply({
      embeds: [embed],
      ephemeral: interaction.options.getBoolean('private'),
    });
  }

  /* ------------------------------------------ */
  /*  Year Zero Roll Render Method              */
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
      throw new RollError(t('commands:help.noDiceError'), roll);
    }

    if (roll.size > this.bot.config.Commands.roll.max) {
      throw new RollError(t('commands:roll.tooManyDiceError'), roll);
    }

    // Rolls the dice.
    if (!roll.rolled) await roll.roll(true);

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

    const data = {
      content: roll.emojify(options.template),
      embeds: [embed],
    };
    data.components = roll.pushable ? this.#createButtons(roll.game, t) : [];

    return data;
  }

  /* ------------------------------------------ */
  /*  Push Methods                              */
  /* ------------------------------------------ */

  /**
   * @param {YearZeroRoll} roll
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   * @param {SebediusCommand.SebediusTranslationCallback} t
   */
  async awaitPush(roll, interaction, t) {
    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: this.bot.config.Commands.roll.pushCooldown,
    });

    // *** COLLECTOR:COLLECT
    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        await i.reply({
          content: `${Emojis.ban} ${t('commands:roll.notYourRoll')}`,
          ephemeral: true,
        });
      }
      else if (i.customId === 'push-button') {
        await roll.push(true);

        // Add any extra pushed dice
        if (this.bot.config.Commands.roll.options[roll.game]?.extraPushDice) {
          for (const ExtraDie of this.bot.config.Commands.roll.options[roll.game].extraPushDice) {
            roll.addDice(ExtraDie, 1);
          }
          await roll.roll();
        }

        // Stops if too many dice.
        if (roll.size > this.bot.config.Commands.roll.max) {
          collector.stop();
          await i.reply({
            content: `${Emojis.warning} ${t('commands:roll.tooManyDiceError')}`,
            ephemeral: true,
          });
          return;
        }

        // Stops the collector if it's the last push.
        if (!roll.pushable) collector.stop();

        // Edits the message with the pushed roll.
        const messageData = await this.render(roll, interaction, t);

        // TODO https://github.com/discordjs/discord.js/issues/8588
        // TODO https://github.com/discord/discord-api-docs/issues/5279
        // ! Also, message.edit does not work with ephemeral messages
        if (interaction.ephemeral) {
          await i.update(messageData); // !
          // await interaction.editReply(messageData); // !
        }
        else {
          await message.edit(messageData); // ! Because using i.update() cause bugs with emojis
          await i.deferUpdate(); // ! Workaround to remove the "interaction failed" error
        }

        // Detects panic.
        if (this.bot.config.Commands.roll.options[roll.game]?.panic && roll.panic) {
          collector.stop();
          const panicCommand = this.bot.commands.get('panic');
          // TODO call PanicCommand
          // await panicCommand.run(interaction, t);
        }
      }
      else if (i.customId === 'cancel-button') {
        collector.stop();
      }
    });

    // *** COLLETOR:END
    // @ts-ignore
    collector.on('end', async () => {
      if (message.components.length && !interaction.ephemeral) {
        await message.edit({ components: [] });
      }
    });
  }

  /* ------------------------------------------ */

  #createButtons(game, t) {
    const pushButton = new ButtonBuilder()
      .setCustomId('push-button')
      .setEmoji(this.bot.config.Commands.roll.options[game]?.successIcon || this.bot.config.Commands.roll.pushIcon)
      .setLabel(t('commands:roll.button.push'))
      .setStyle(ButtonStyle.Primary);

    const cancelButton = new ButtonBuilder()
      .setCustomId('cancel-button')
      .setEmoji(this.bot.config.Commands.roll.cancelIcon)
      .setLabel(t('commands:roll.button.cancel'))
      .setStyle(ButtonStyle.Secondary);

    const firstActionRow = new ActionRowBuilder()
      .addComponents(pushButton, cancelButton);

    return [firstActionRow];
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
    if (options.trauma && roll.pushed) {
      const n = roll.attributeTrauma;
      out.push(t('commands:roll.embed.trauma', { count: n }));
    }

    // Gear Damage
    if (options.gearDamage && roll.pushed) {
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
        out.push(t('commands:roll.embed.ammoSpent', { count: roll.sum(YearZeroDieTypes.AMMO) }));
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
        const dice = roll.getDice(type);
        if (dice.length) {
          const rpc = roll.pushCount;
          for (let p = rpc; p > 0; p--) {
            const diceResults = dice
              .filter(d => rpc - d.pushCount < p)
              .map(d => d.results[d.pushCount - (rpc - p) - 1]);
            out.push(`#${p} [${typeName.toLowerCase()}]: ${diceResults.join(', ')}`);
          }
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
 * @property {number}   type
 * @property {boolean} [required=false]
 * @property {number}  [min]
 * @property {number}  [max]
 */
