const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const SebediusCommand = require('../../structures/command');
const YearZeroRoll = require('../../yearzero/roller/yzroll');
const { YearZeroGames, YearZeroRollTables } = require('../../constants');
const { clamp } = require('../../utils/number-utils');

module.exports = class PanicCommand extends SebediusCommand {
  constructor(client) {
    super(client, {
      category: SebediusCommand.CategoryFlagsBits.ROLL,
      data: new SlashCommandBuilder()
        .setName('panic')
        .setDescription('Roll a random panic effect for ALIEN RPG')
        .addIntegerOption(opt => opt
          .setName('stress')
          .setDescription('Starting stress level')
          .setMinValue(0)
          .setRequired(true))
        .addBooleanOption(opt => opt
          .setName('fixed')
          .setDescription('Use a fixed number instead (doesn\'t add a D6)'))
        .addIntegerOption(opt => opt
          .setName('minpanic')
          .setDescription('Adjust a minimum threshold for multiple consecutive panic effects'))
        .addBooleanOption(opt => opt
          .setName('nerves')
          .setDescription('Apply the talent *Nerves of Steel*'))
        .addBooleanOption(opt => opt
          .setName('private')
          .setDescription('Whether to hide the result from other players')),
    });
  }
  /** @type {SebediusCommand.SebediusCommandRunFunction} */
  async run(interaction, t) {
    const stress = interaction.options.getInteger('stress');
    const minPanic = interaction.options.getInteger('minpanic');
    const isFixed = interaction.options.getBoolean('fixed');
    const hasNerves = interaction.options.getBoolean('nerves');

    return this.panic(interaction, t, { stress, minPanic, isFixed, hasNerves });
  }

  /**
   * @param {SebediusCommand.SebediusCommandInteraction} interaction
   * @param {SebediusCommand.SebediusTranslationCallback} t
   * @param {Object}  args
   * @param {number}  args.stress
   * @param {number}  args.minPanic
   * @param {boolean} args.isFixed
   * @param {boolean} args.hasNerves
   */
  async panic(interaction, t, { stress, minPanic, isFixed, hasNerves }) {
    const panicRoll = new YearZeroRoll({
      game: YearZeroGames.ALIEN_RPG,
      name: t('commands:panic.panicRoll'),
      author: interaction.member,
    });
    panicRoll.addStressDice(1);
    await panicRoll.roll(true);
    if (isFixed) panicRoll.dice[0].results = [0];

    const panicRand = panicRoll.valueOf();
    const panicValue = stress + panicRand - (hasNerves ? 2 : 0);
    const panicMin = clamp(minPanic, 0, 15);
    const panicLowerThanMin = panicValue < panicMin;
    const panicValueMore = panicLowerThanMin ? panicMin + 1 : panicValue;
    const panicResult = clamp(panicValueMore, 0, 15);

    // @ts-ignore
    const panicTable = await this.bot.getTable(t.lng, YearZeroRollTables.PANIC);

    /** @type {{ icon, name, description }} */
    const panicAction = panicTable.get(panicResult, true);

    if (!panicAction) {
      return interaction.reply({
        content: `${this.bot.config.Emojis.error} ${t('commands:panic.panicEffectNotFoundError')}`,
        ephemeral: true,
      });
    }

    // Builds the message's content.
    let text = `${panicAction.icon} ${panicRoll.name.toUpperCase()}:`
      + ` **${stress}** + ${panicRoll.emojify()}`;

    if (hasNerves) text += ` − 2 *(${t('commons:talents.alien.nervesOfSteel')})*`;
    if (panicMin) text += ` ${panicLowerThanMin ? '<' : '≥'} ${panicMin}`;

    // Builds the embed.
    const embed = new EmbedBuilder()
      .setTitle(`${panicAction.name} (${panicResult})`)
      .setDescription(panicAction.description)
      .setColor(this.bot.config.favoriteColor)
      .setTimestamp();

    // Interrupted skill roll reminder.
    if (panicValue >= 10) {
      embed.addFields({
        name: t('commands:panic.interruptedSkillRollTitle'),
        value: t('commands:panic.interruptedSkillRollText'),
      });
    }

    // Permanent Mental Trauma reminder.
    if (panicValue >= 13) {
      embed.addFields({
        name: t('commands:panic.mentalTraumaReminderTitle'),
        value: t('commands:panic.mentalTraumaReminderText'),
      });
    }

    // Sends the message.
    const messageData = {
      content: text,
      embeds: [embed],
      ephemeral: interaction.options.getBoolean('private'),
    };

    if (interaction.replied) return interaction.followUp(messageData);
    return interaction.reply(messageData);
  }
};
