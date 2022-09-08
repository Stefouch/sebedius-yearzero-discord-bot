const {
  EmbedBuilder, ApplicationCommandOptionType,
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
const { sleep } = require('../../utils/discord-utils');
const Logger = require('../../utils/logger');

/* ------------------------------------------ */
/*  Command Parameters                        */
/*    These can be modified                   */
/* ------------------------------------------ */

/** @enum {string[]} */
const GameSubcommandsList = {
  [YearZeroGames.BLANK]: ['input', 'title', 'private'],
  [YearZeroGames.ALIEN_RPG]: [
    'dice', 'stress', 'title', 'modifier', 'maxpush', 'fullauto', 'nerves', 'minpanic', 'private',
  ],
  [YearZeroGames.BLADE_RUNNER]: ['abcd', 'title', 'modifier', 'maxpush', 'private'],
  [YearZeroGames.CORIOLIS]: ['dice', 'title', 'modifier', 'maxpush', 'fullauto', 'private'],
  [YearZeroGames.FORBIDDEN_LANDS]: [
    'base', 'skill', 'gear', 'neg', 'artifacts', 'title', 'modifier', 'maxpush', 'pride', 'private',
  ],
  [YearZeroGames.MUTANT_YEAR_ZERO]: [
    'base', 'skill', 'gear', 'neg', 'artifacts', 'title', 'modifier', 'maxpush', 'fullauto', 'private',
  ],
  [YearZeroGames.TALES_FROM_THE_LOOP]: ['dice', 'title', 'modifier', 'maxpush', 'private'],
  [YearZeroGames.TWILIGHT_2K]: ['abcd', 'ammo', 'title', 'modifier', 'maxpush', 'fullauto', 'private'],
  [YearZeroGames.VAESEN]: ['dice', 'title', 'modifier', 'maxpush', 'private'],
};

/** @enum {SebediusCommand.SlashCommandOption} */
const SlashCommandOptions = {
  input: {
    description: 'A roll string for the dice to roll in the format NdX!>XfX (separate multiple rolls with a space)',
    type: ApplicationCommandOptionType.String,
    required: true,
  },
  abcd: {
    description: 'Type any of the following: `12`, `10`, `8`, `6`, `a`, `b`, `c`, `d`',
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
  neg: {
    description: 'Quantity of Negative dice (6 removes one success)',
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
    description: 'Adjust a minimum treshold for multiple consecutive panic effects',
    type: ApplicationCommandOptionType.Integer,
  },
};

/* ------------------------------------------ */
/* Roll Command                               */
/* ------------------------------------------ */

module.exports = class RollCommand extends SebediusCommand {
  constructor(client) {
    super(client, {
      category: SebediusCommand.CategoryFlagsBits.ROLL,
      data: SebediusCommand.createSlashCommandBuilder(
        'roll',
        'Roll dice for any Year Zero roleplaying game',
        GameSubcommandsList,
        SlashCommandOptions,
      ),
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
    const neg = interaction.options.getInteger('neg');
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
      const input = interaction.options.getString('abcd')?.toLowerCase();
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
    if (neg) roll.addNegDice(neg);
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
    if (this.isPanic(roll)) roll.setMaxPush(0);
    else if (maxPush != null) roll.setMaxPush(maxPush);
    else {
      const fullauto = interaction.options.getBoolean('fullauto');
      if (fullauto) roll.setMaxPush(10);
    }

    // Renders the roll to the chat.
    /** @type {import('discord.js').InteractionReplyOptions} */
    const messageData = await this.render(roll, t);
    await interaction.reply({
      ...messageData,
      ephemeral: interaction.options.getBoolean('private'),
      fetchReply: true,
    });


    // Detects panic.
    if (this.isPanic(roll)) return this.fetchPanic(roll, interaction, t);
    if (roll.pushable) await this.awaitPush(roll, interaction, t);
  }

  /* ------------------------------------------ */
  /*  Generic Roll Method                       */
  /* ------------------------------------------ */

  /**
   * Parses & renders a generic roll.
   * @param {string} input
   * @param {string} title
   * @param {SebediusCommand.SebediusCommandInteraction} interaction
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
   * @param {SebediusCommand.SebediusTranslationCallback} t
   */
  async render(roll, t) {
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
   * @param {SebediusCommand.SebediusCommandInteraction} interaction
   * @param {SebediusCommand.SebediusTranslationCallback} t
   */
  async awaitPush(roll, interaction, t) {
    const message = await interaction.fetchReply();
    const gameOptions = this.bot.config.Commands.roll.options[roll.game];

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
      else if (['push-button', 'pray-button', 'chapel-button'].includes(i.customId)) {
        await roll.push(true);

        const extraPushDice = [];

        // Adds any extra pushed dice.
        if (gameOptions?.extraPushDice) {
          extraPushDice.push(...gameOptions.extraPushDice);
        }

        // Idem, but for Coriolis.
        if (['pray-button', 'chapel-button'].includes(i.customId)) {
          extraPushDice.push(...gameOptions.pushMenu.find(b => b.customId === i.customId).extraPushDice);
        }

        if (extraPushDice.length) {
          for (const ExtraDie of extraPushDice) roll.addDice(ExtraDie, 1);
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
        const messageData = await this.render(roll, t);

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
        if (this.isPanic(roll)) {
          collector.stop();
          await this.fetchPanic(roll, interaction, t);
        }
      }
      else if (i.customId === 'cancel-button') {
        collector.stop();
      }
    });

    // *** COLLETOR:END
    collector.on('end', async () => {
      if (message.components.length && !interaction.ephemeral) {
        await message.edit({ components: [] });
      }
    });
  }

  /* ------------------------------------------ */

  #createButtons(game, t) {
    const gameOptions = this.bot.config.Commands.roll.options[game];

    const pushButton = new ButtonBuilder()
      .setCustomId('push-button')
      .setEmoji(gameOptions?.successIcon || this.bot.config.Commands.roll.pushIcon)
      .setLabel(t('commands:roll.buttons.push'))
      .setStyle(ButtonStyle.Primary);

    const cancelButton = new ButtonBuilder()
      .setCustomId('cancel-button')
      .setEmoji(this.bot.config.Commands.roll.cancelIcon)
      .setLabel(t('commands:roll.buttons.cancel'))
      .setStyle(ButtonStyle.Secondary);

    const actionRows = [];

    const firstActionRow = new ActionRowBuilder()
      .addComponents(pushButton, cancelButton);

    actionRows.push(firstActionRow);

    // If we have a custom push menu, we add the buttons configured in the config.
    if (gameOptions?.pushMenu) {
      const secondActionRow = new ActionRowBuilder();
      for (const buttonData of gameOptions.pushMenu) {
        const button = new ButtonBuilder({
          style: ButtonStyle.Primary,
          customId: buttonData.customId,
          emoji: buttonData.emoji,
          label: t(buttonData.label),
        });
        secondActionRow.addComponents(button);
      }
      actionRows.push(secondActionRow);
    }

    return actionRows;
  }

  /* ------------------------------------------ */
  /*  Utils Methods                             */
  /* ------------------------------------------ */

  /**
   * @param {YearZeroRoll} roll
   * @param {SebediusCommand.SebediusCommandInteraction} interaction
   * @param {SebediusCommand.SebediusTranslationCallback} t
   */
  async fetchPanic(roll, interaction, t) {
    Logger.roll('roll:alien → Panic!');
    await sleep(2000);
    /** @type {import('./panic')} */
    // @ts-ignore
    const panicCommand = this.bot.commands.get('panic');
    return panicCommand.panic(interaction, t, {
      stress: roll.stress,
      minPanic: interaction.options.getInteger('minpanic'),
      isFixed: false,
      hasNerves: interaction.options.getBoolean('nerves'),
    });
  }

  /* ------------------------------------------ */

  isPanic(roll) {
    return this.bot.config.Commands.roll.options[roll.game]?.panic && roll.panic;
  }

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
    if (options.trauma && roll.pushed && roll.attributeTrauma > 0) {
      out.push(`${t('commands:roll.embed.trauma', { count: roll.attributeTrauma })} ${Emojis.anger}`);
    }

    // Gear Damage
    if (options.gearDamage && roll.pushed && roll.gearDamage > 0) {
      out.push(`${t('commands:roll.embed.gearDamage', { count: roll.gearDamage })} ${Emojis.boom}`);
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
        if (b > 0) out.push(`${t('commands:roll.embed.damageOrStress', { count: b })} ${Emojis.anger}`);
        const j = roll.jamCount;
        if (j > 0) out.push(`${t('commands:roll.embed.reliability', { count: j })} ${Emojis.boom}`);
        if (roll.jammed) out.push(`${t('commands:roll.embed.weaponJam')} ‼️`);
      }
    }

    // Panic (Alien RPG)
    if (options.panic && roll.panic) {
      out.push(`${t('commands:roll.embed.panic')} ‼️`);
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
