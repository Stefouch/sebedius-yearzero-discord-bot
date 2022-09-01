const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const SebediusCommand = require('../../structures/command');
const { Emojis } = require('../../config');

module.exports = class ThreadCommand extends SebediusCommand {
  constructor(client) {
    super(client, {
      category: SebediusCommand.CategoryFlagsBits.ADMIN,
      data: new SlashCommandBuilder()
        .setName('thread')
        .setDescription('Make the bot join or leave a thread')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads)
        .addSubcommand(sub => sub
          .setName('join')
          .setDescription('Make the bot join the current thread'))
        .addSubcommand(sub => sub
          .setName('leave')
          .setDescription('Make the bot leave the current thread')),
    });
  }
  /** @type {SebediusCommand.SebediusCommandRunFunction} */
  async run(interaction, t) {
    const thread = interaction.channel;

    if (!thread.isThread()) {
      return interaction.reply({
        content: `${Emojis.shrug} ${t('commands:thread.notThreadError')}`,
        ephemeral: true,
      });
    }

    const cmd = interaction.options.getSubcommand();

    if (cmd === 'join') {
      if (thread.joinable) {
        await thread.join();
        await interaction.reply({
          content: `${Emojis.ok} ${t('commands:thread.join')}`,
          ephemeral: true,
        });
      }
    }
    else if (cmd === 'leave') {
      await thread.leave();
      await interaction.reply({
        content: `${Emojis.ok} ${t('commands:thread.leave')}`,
        ephemeral: true,
      });
    }
  }
};
