const { SlashCommandBuilder, inlineCode } = require('discord.js');
const SebediusCommand = require('../../structures/command');

const events = ['guildCreate', 'guildDelete'];

module.exports = class EmitCommand extends SebediusCommand {
  constructor(client) {
    super(client, {
      ownerOnly: true,
      category: SebediusCommand.CategoryFlagsBits.ADMIN,
      data: new SlashCommandBuilder()
        .setName('emit')
        .setDescription('Emit an event')
        .addStringOption(opt => opt
          .setName('event')
          .setDescription('Choose the event to emit')
          .addChoices(...events.map(e => ({ name: e, value: e })))
          .setRequired(true)),
    });
  }
  /** @type {SebediusCommand.SebediusCommandRunFunction} */
  async run(interaction, t) {
    if (interaction.user.id !== this.bot.ownerId) {
      return interaction.reply({
        content: `⛔ ${t('commands:ownerOnlyCommandDisclaimer')}`,
        ephemeral: true,
      });
    }

    const event = interaction.options.getString('event');

    switch (event) {
      case 'guildCreate':
      case 'guildDelete': this.bot.emit(event, interaction.guild); break;
    }

    return interaction.reply({
      content: `☄ **Event** ${inlineCode(event)} emitted!`,
      ephemeral: true,
    });
  }
};
