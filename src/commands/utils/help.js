const { SlashCommandBuilder, EmbedBuilder, hyperlink, inlineCode } = require('discord.js');
const SebediusCommand = require('../../structures/command');

module.exports = class HelpCommand extends SebediusCommand {
  /** @param {import('@structures/sebedius-client')} client */
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
    const commandName = interaction.options.getString('command');

    if (!commandName) {
      embed
        .setTitle('**Sebedius – Year Zero Discord Bot**')
        .setDescription(t('commands:help.fullDescription') + ' https://github.com/Stefouch/sebedius-myz-discord-bot')
        .setTimestamp()
        .addFields({
          name: `🏁 ${t('commands:help.deployedVersion')}`,
          value: this.bot.version,
          inline: true,
        }, {
          name: `🛠 ${t('commands:help.developer')}`,
          value: `${(await this.bot.getUser(this.bot.ownerId)).toString()}\n${hyperlink('stefouch.be', 'https://www.stefouch.be')}`,
          inline: true,
        }, {
          name: '🐦 Twitter',
          value: hyperlink('@stefouch', 'https://twitter.com/stefouch'),
          inline: true,
        }, {
          name: `🔗 ${t('commands:help.usefulLinks')}`,
          value: `• ${hyperlink(t('commands:help.addToServer'), this.bot.inviteURL)}`
            + `\n• ${hyperlink(t('commands:help.readTheWiki'), this.bot.config.wikiURL)}`
            + `\n• ${hyperlink(t('commands:help.githubIssues'), this.bot.config.issueURL)}`,
          inline: false,
        }, {
          name: '❤ Patreon',
          value: t('commands:help.supportOnPatreon', {
            url: hyperlink(t('commands:help.patreonPage'), 'https://patreon.com/Stefouch'),
          }),
          inline: false,
        }, {
          name: `🗒 ${t('commands:help.listOfCommands')}`,
          value: t('commands:help.listOfCommandsFullDescription', {
            helpAll: inlineCode('/help all'),
            helpCommand: inlineCode('/help <command>'),
          }),
          inline: false,
        });
    }
    // Help message with the list of all commands.
    else if (commandName === 'all') {}
    // Help message for a specific command.
    else {
      const command = this.bot.commands.get(commandName);

      if (!command) {
        return interaction.reply({
          content: `🤷 ${t('commands:help.commandNotFound', {
            cmd: inlineCode(commandName),
          })}`,
          ephemeral: true,
        });
      }
      await interaction.reply({ embeds: [embed] });
    }
  }
};
