const { SlashCommandBuilder } = require('discord.js');
const SebediusCommand = require('./structures/command');

module.exports = class TemplateCommand extends SebediusCommand {
  constructor(client) {
    super(client, {
      ownerOnly: true, // <- Command is hidden & available for the bot owner only
      category: SebediusCommand.CategoryFlagsBits.UTILS,
      data: new SlashCommandBuilder()
        .setName('cmd')
        .setDescription('Template command'),
      // etc...
    });
  }
  /** @type {SebediusCommand.SebediusCommandRunFunction} */
  // eslint-disable-next-line no-unused-vars
  async run(interaction, t, guildOptions) {
    // Add the command effects here.
  }
};
