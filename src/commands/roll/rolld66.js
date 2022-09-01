const { SlashCommandBuilder, inlineCode, EmbedBuilder } = require('discord.js');
const SebediusCommand = require('../../structures/command');
const YearZeroRoll = require('../../yearzero/roller/yzroll');
const { YearZeroGameChoices, YearZeroGameNames } = require('../../constants');

module.exports = class RollD66Command extends SebediusCommand {
  constructor(client) {
    super(client, {
      category: SebediusCommand.CategoryFlagsBits.ROLL,
      data: new SlashCommandBuilder()
        .setName('rolld66')
        .setDescription('Roll a d6, d66 or d666 die')
        .addStringOption(opt => opt
          .setName('die')
          .setDescription('Choose d6, d66 or d666')
          .addChoices(
            { name: 'D6', value: 'D6' },
            { name: 'D66', value: 'D66' },
            { name: 'D666', value: 'D666' })
          .setRequired(true))
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
    const die = interaction.options.getString('die');

    const n = die.split('6').length - 1;

    const roll = new YearZeroRoll({
      game,
      name: interaction.options.getString('title') || inlineCode(die),
      author: interaction.member,
    }).addBaseDice(n)
      .setMaxPush(0);

    await roll.roll();

    const embed = new EmbedBuilder()
      .setTitle(roll.name)
      .setColor(this.bot.config.favoriteColor)
      .setTimestamp()
      .setFooter({ text: YearZeroGameNames[roll.game] })
      .setDescription(t('commands:rolld66.resultForD66', {
        author: roll.author.toString(),
        dice: inlineCode(die),
        result: `__**${roll.sumProductBaseTen()}**__`,
      }));

    return interaction.reply({
      content: roll.emojify(),
      embeds: [embed],
      ephemeral: interaction.options.getBoolean('private'),
    });
  }
};
