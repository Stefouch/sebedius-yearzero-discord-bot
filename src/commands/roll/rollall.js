const { SlashCommandBuilder } = require('discord.js');
const { YearZeroGameChoices } = require('../../constants');
const SebediusCommand = require('../../structures/command');
const RollCommand = require('./roll');

module.exports = class RollAllCommand extends SebediusCommand {
  constructor(client) {
    super(client, {
      category: SebediusCommand.CategoryFlagsBits.ROLL,
      data: new SlashCommandBuilder()
        .setName('rolla')
        .setDescription('Roll dice, all arguments available')
        .addStringOption(opt => opt
          .setName('game')
          .setDescription('Override the default chosen game which is used to render the rolled dice')
          .addChoices(...YearZeroGameChoices)),
    });
    for (const [optionName, option] of Object.entries(RollCommand.SlashCommandOptions)) {
      this.addOptionToCommand(
        this.name,
        this.data,
        optionName,
        option,
        { allowRequired: false, overrideCmdName: 'roll' },
      );
    }
  }
  /** @type {SebediusCommand.SebediusCommandRunFunction} */
  async run(interaction, t, guildOptions) {
    const game = interaction.options.getString('game') || guildOptions.game;

    // TODO keep or clean
    // if (game === YearZeroGames.BLANK) {
    //   return interaction.reply({
    //     content: t('commands:r.notGeneric'),
    //     ephemeral: true,
    //   });
    // }

    // @ts-ignore
    interaction.options._subcommand = game;
    interaction.commandName = 'roll';
    // I use emit instead of this.bot.commands.get().run() so the command count is incremented.
    return this.bot.emit('interactionCreate', interaction);
  }
};
