const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const SebediusCommand = require('../../structures/command');
const YearZeroRoll = require('../../yearzero/roller/yzroll');
const { YearZeroGames, YearZeroRollTables } = require('../../constants');
const { Emojis } = require('../../config');
const { clamp } = require('../../utils/number-utils');

module.exports = class PanicCommand extends SebediusCommand {
  constructor(client) {
    super(client, {
      category: SebediusCommand.CategoryFlagsBits.ROLL,
      data: new SlashCommandBuilder()
        .setName('panic')
        .setDescription('Rolls a random panic effect for the ALIEN RPG')
        .addIntegerOption(opt => opt
          .setName('stress')
          .setDescription('Starting stress level')
          .setRequired(true))
        .addBooleanOption(opt => opt
          .setName('fixed')
          .setDescription('Use a fixed number instead (doesn\'t add a D6)'))
        .addIntegerOption(opt => opt
          .setName('min')
          .setDescription('Adjust a minimum threshold for multiple consecutive panic effects'))
        .addBooleanOption(opt => opt
          .setName('nerves')
          .setDescription('Apply the talent *Nerves of Steel*')),
    });
  }
  /** @type {SebediusCommand.SebediusCommandRunFunction} */
  async run(interaction, t) {
    const stress = interaction.options.getInteger('stress');
    const minPanic = interaction.options.getInteger('min');
    const isFixed = interaction.options.getBoolean('fixed');
    const hasNerves = interaction.options.getBoolean('nerves');

    const panicRoll = new YearZeroRoll({
      game: YearZeroGames.ALIEN_RPG,
      name: 'Panic Roll',
      author: interaction.member,
    });
    await panicRoll.addStressDice(1).roll();

    const panicRand = panicRoll.valueOf();
    const panicValue = stress + panicRand - (hasNerves ? 2 : 0);
    const panicMin = clamp(minPanic, 0, 15);
    const panicLowerThanMin = panicValue < panicMin;
    const panicValueMore = panicLowerThanMin ? panicMin + 1 : panicValue;
    const panicResult = clamp(panicValueMore, 0, 15);

    this.bot.getTable(t.lng, YearZeroRollTables.PANIC);

    let panicTable;
    let panicAction;
    if (!panicAction) {
      return interaction.reply({
        content: `${Emojis.error} ${t('commands:panic.panicEffectNotFoundError')}`,
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder();
  }
};
