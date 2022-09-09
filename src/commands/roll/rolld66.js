const { SlashCommandBuilder, inlineCode, EmbedBuilder } = require('discord.js');
const SebediusCommand = require('../../structures/command');
const YearZeroRoll = require('../../yearzero/roller/yzroll');
const { YearZeroGameChoices, YearZeroGameNames, YearZeroGames } = require('../../constants');

module.exports = class RollD66Command extends SebediusCommand {
  constructor(client) {
    super(client, {
      category: SebediusCommand.CategoryFlagsBits.ROLL,
      data: new SlashCommandBuilder()
        .setName('rolld66')
        .setDescription('Roll a d6, d66 or d666 die')
        .setDMPermission(false)
        .addStringOption(opt => opt
          .setName('die')
          .setDescription('Choose d6, d66 or d666')
          .addChoices(
            { name: 'D6', value: 'D6' },
            { name: 'D66', value: 'D66' },
            { name: 'D666', value: 'D666' }))
        .addStringOption(opt => opt
          .setName('title')
          .setDescription('Define a title for the roll'))
        .addBooleanOption(opt => opt
          .setName('private')
          .setDescription('Whether to hide the roll from other players'))
        .addStringOption(opt => opt
          .setName('game')
          .setDescription('Override the default chosen game which is used to render the rolled dice')
          .addChoices(...YearZeroGameChoices)),
    });
  }
  /** @type {SebediusCommand.SebediusCommandRunFunction} */
  async run(interaction, t, guildOptions) {
    const game = interaction.options.getString('game') || guildOptions.game;
    const die = interaction.options.getString('die') ?? 'D66';

    return this.rollD66(game, die, interaction, t);
  }
  /**
   * @param {string} game
   * @param {string} die "D66" or "D666"
   * @param {SebediusCommand.SebediusCommandInteraction} interaction
   * @param {SebediusCommand.SebediusTranslationCallback} t
   */
  async rollD66(game, die, interaction, t) {
    const n = die.split('6').length - 1;

    const roll = new YearZeroRoll({
      game,
      name: interaction.options.getString('title') || inlineCode(die),
      author: interaction.member,
    }).addBaseDice(n)
      .setMaxPush(0);

    await roll.roll(true);

    const embed = new EmbedBuilder()
      .setTitle(roll.name)
      .setColor(this.bot.config.favoriteColor)
      .setTimestamp()
      .setFooter({ text: YearZeroGameNames[game] })
      .setDescription(t('commands:rolld66.resultForD66', {
        author: roll.author.toString(),
        dice: inlineCode(die),
        result: `__**${roll.sumProductBaseTen()}**__`,
      }));

    // If the game has blank dice, we should use the default template.
    const hasBlankDice = this.bot.config.Commands.roll.options[game]?.hasBlankDice;

    return interaction.reply({
      content: roll.emojify(hasBlankDice ? YearZeroGames.BLANK : game),
      embeds: [embed],
      ephemeral: interaction.options.getBoolean('private'),
    });
  }
};
