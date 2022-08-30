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
          // eslint-disable-next-line max-len
          .setDescription('Prints more information about a specific command or type "all" to see a list of all commands')
          .addChoices(...client.commands.map(c => ({ name: c.name, value: c.name }))),
        ),
    });
  }
  /** @type {SebediusCommand.SebediusCommandRunFunction} */
  async run(interaction, t) {
    const embed = new EmbedBuilder()
      .setColor(this.bot.config.favoriteColor)
      .setTimestamp();

    const commandName = interaction.options.getString('command');
    if (!commandName) {
      embed
        .setTitle('**Sebedius – Year Zero Discord Bot**')
        .setDescription(t('commands:help.fullDescription') + ' https://github.com/Stefouch/sebedius-myz-discord-bot')
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
    else if (commandName === 'all') {
      embed
        .setTitle('**Sebedius – Year Zero Discord Bot**')
        .setDescription(`${this.bot.config.wikiURL}#list-of-commands`);

      // Hides ownerOnly commands.
      const commands = this.bot.commands.filter(c => !c.ownerOnly);

      for (const [cat, code] of Object.entries(SebediusCommand.CategoryFlagsBits)) {
        const category = `commands:categories.${cat.toLowerCase()}`;
        const cmds = commands.filter(c => c.category === code);

        if (cmds.size) {
          embed.addFields({
            name: `• ${t(category)}`,
            value: [...cmds.mapValues(c => inlineCode(c.name)).values()].join(', '),
            inline: true,
          });
        }
      }
    }
    // Help message for one specific command.
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

      // Gets the localized description.
      // @ts-ignore
      const lng = t.lng;
      // if (lng === 'en-US' || lng === 'en-GB') lng = 'en';
      let commandDescription = command.data.description_localizations?.[lng];
      if (!commandDescription) commandDescription = command.description;

      embed
        .setTitle(inlineCode(commandName))
        .setDescription(commandDescription)
        .addFields({
          name: 'Wiki',
          value: `${this.bot.config.wikiURL}/%21${commandName}`,
        });
    }
    await interaction.reply({ embeds: [embed] });
  }
};
