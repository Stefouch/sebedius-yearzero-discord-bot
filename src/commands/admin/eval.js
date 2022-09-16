const { SlashCommandBuilder, EmbedBuilder, codeBlock } = require('discord.js');
const SebediusCommand = require('../../structures/command');
const Logger = require('../../utils/logger');

module.exports = class EvalCommand extends SebediusCommand {
  constructor(client) {
    super(client, {
      ownerOnly: true,
      category: SebediusCommand.CategoryFlagsBits.ADMIN,
      data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Evaluate javascript code')
        .addStringOption(opt => opt
          .setName('code')
          .setDescription('The code to evaluate')
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

    await interaction.deferReply({ ephemeral: true });

    let code = interaction.options.getString('code');

    // Attempts to forbid the return of the bot token.
    code = code.replace('token', 'state');

    let evaled;
    try {
      evaled = eval(code);

      if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);

      // Just to be sure
      evaled = evaled.replace(this.bot.token, '🛑[REDACTED]');

      if (evaled.length > 1024) {
        throw new Error(`Whoops! Too long! ${evaled.length} characters > 1024`);
      }
    }
    catch (err) {
      Logger.error(err);
      const failedEvalEmbed = new EmbedBuilder()
        .setTitle('Error during eval!')
        .setDescription('An error occured! Please review the code and the error!')
        .setColor(0xff0000)
        .addFields({
          name: 'Input:',
          value: codeBlock('js', code),
        }, {
          name: 'Error:',
          value: codeBlock('js', err),
        })
        .setFooter({ text: 'Evaluation Error' })
        .setTimestamp();

      return interaction.editReply({ embeds: [failedEvalEmbed] });
    }

    const embed = new EmbedBuilder()
      .setTitle('Evaluated successfully')
      // .setDescription('d')
      .setColor(this.bot.config.Colors.green)
      .addFields({
        name: 'Input:',
        value: codeBlock('js', code),
      }, {
        name: 'Output:',
        value: codeBlock('js', evaled),
      })
      .setFooter({ text: 'Sebedius Eval' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  }
};
