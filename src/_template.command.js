const { SlashCommandBuilder } = require('discord.js');
const SebediusCommand = require('./structures/command');

module.exports = class RollD66Command extends SebediusCommand {
  constructor(client) {
    super(client, {
      ownerOnly: true, // <- Command is hidden & available for the bot owner only
      category: SebediusCommand.CategoryFlagsBits.ROLL,
      data: new SlashCommandBuilder()
        .setName('cmd')
        .setDescription('Template command'),
      // etc...
    });
  }
  /** @type {SebediusCommand.SebediusCommandRunFunction} */
  async run(interaction, t, guildOptions) {
    // Add the command effects here.
  }
};
