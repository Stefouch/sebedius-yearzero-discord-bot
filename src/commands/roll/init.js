const { SlashCommandBuilder } = require('discord.js');
const SebediusCommand = require('../../structures/command');
const InitiativeDeck = require('../../yearzero/initiative/initiative-deck');

module.exports = class InitiativeCommand extends SebediusCommand {
  constructor(client) {
    super(client, {
      category: SebediusCommand.CategoryFlagsBits.UTILS,
      data: new SlashCommandBuilder()
        .setName('initiative')
        // .setDescription('Draw one or more initiative cards')
        // .addSubcommand(sub => sub
        //   .setName('roll')
        //   .setDescription('Roll for initiative'))
        .addSubcommand(sub => sub
          .setName('draw')
          .setDescription('Draw one or more initiative cards')
          .addIntegerOption(opt => opt
            .setName('speed')
            .setDescription('Number of initiative cards to draw')
            .setMinValue(1)
            .setMaxValue(10))
          .addIntegerOption(opt => opt
            .setName('haste')
            .setDescription('Number of initiative cards to keep')
            .setMinValue(1)
            .setMaxValue(10)))
        .addSubcommand(sub => sub
          .setName('shuffle')
          .setDescription('Reset the deck *(which is probably needed at the beginning of every new encounter)*')),
    });
  }
  /** @type {SebediusCommand.SebediusCommandRunFunction} */
  async run(interaction, t, guildOptions) {
    const speed = interaction.options.getInteger('speed');
    const haste = interaction.options.getInteger('haste');
  }
  async reset() {

  }
};
