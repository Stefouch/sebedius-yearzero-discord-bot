const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const SebediusCommand = require('../../discord/command');

module.exports = class HelpCommand extends SebediusCommand {
  /** @param {import('../../discord/client')} client */
  constructor(client) {
    super(client, {
      category: SebediusCommand.CategoryFlagsBits.UTILS,
      data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('View information about how to use Sebedius')
        .addStringOption(opt => opt
          .setName('command')
          .setDescription('Input command')
          .addChoices(...client.commands.map(c => ({ name: c.name, value: c.name }))),
        ),
    });
  }
  /** @type {SebediusCommand.SebediusCommandRunFunction} */
  async run(interaction, t) {
    const embed = new EmbedBuilder();
    const bot = interaction.client;
    const commandName = interaction.options.getString('command');

    if (!commandName) {
      embed
        .setTitle('**Sebedius – Year Zero Discord Bot**')
        .addFields({
          name: `🏁 ${t('command:help.deployed_version')}`,
          value: bot.version,
          inline: true,
        }, {
          name: `🛠 ${t('command:help.developer')}`,
          value: (await bot.getUser(bot.ownerId)).toString(),
          inline: true,
        }, {
          name: '🐦 Twitter',
          value: 'https://twitter.com/stefouch',
          inline: true,
        }, {
          name: `📖 ${t('command:help.readme')}`,
          value: 'https://github.com/Stefouch/sebedius-yearzero-discord-bot/blob/master/README.md',
          inline: false,
        });
    }
  }
};
