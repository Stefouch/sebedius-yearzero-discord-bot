const { SlashCommandBuilder, EmbedBuilder, hyperlink, inlineCode } = require('discord.js');
const SebediusCommand = require('../../structures/command');
const { trimString } = require('../../utils/string-utils');

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
          .setDescription('Print more information about a specific command or type "all" to see a list of all commands'),
          // TODO autocomplete
          // .setAutocomplete(true),
        ),
    });
  }
  /** @type {SebediusCommand.SebediusCommandRunFunction} */
  async run(interaction, t) {
    const embed = new EmbedBuilder()
      .setColor(this.bot.config.Colors.favoriteColor);

    const commandName = interaction.options.getString('command');
    if (!commandName) {
      embed
        .setTitle('**Sebedius – Year Zero Discord Bot**')
        .setDescription(t('commands:help.fullDescription') + ' https://github.com/Stefouch/sebedius-myz-discord-bot')
        // TODO Slash command Update - Disclaimer - remove later
        .addFields({
          name: `${this.bot.config.Emojis.warning} Important Changes!`,
          value: 'As of September 1st 2022, due to Discord policies change for bots,'
          + ' Sebedius cannot read the content of messages anymore.'
          + ' The is the end of *prefixed* `!commands`. Consequently, all Sebedius commands are disabled.'
          + '\nBut!.. I am slowly converting all the "old" commands into the new Discord standard for bots:'
          + ' *Slash* `/commands`! The task is huge (there were 50+ commands) and will take time unfortunately.'
          + ' Stay tuned!'
          + '\n[Read more about slash commands here](https://discord.com/blog/welcome-to-the-new-era-of-discord-apps/)',
        })
        .addFields({
          name: `🏁 ${t('commands:help.deployedVersion')}`,
          value: this.bot.version,
          inline: true,
        }, {
          name: `🛠️ ${t('commands:help.developer')}`,
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
            + `\n• ${hyperlink(t('commands:help.githubIssues'), this.bot.config.issueURL)}`
            + `\n• ${hyperlink(t('commands:help.contribute'), this.bot.config.contributeURL)}`,
          inline: false,
        }, {
          name: '💖 Patreon',
          value: t('commands:help.supportOnPatreon', {
            url: hyperlink(t('commands:help.patreonPage'), 'https://patreon.com/Stefouch'),
          }),
          inline: false,
        }, {
          name: `🗒️ ${t('commands:help.listOfCommands')}`,
          value: t('commands:help.listOfCommandsFullDescription', {
            helpAll: inlineCode('/help all'),
            helpCommand: inlineCode('/help <command>'),
          }),
          inline: false,
        });
    }
    // Help message with the list of all commands.
    else if (commandName === 'all' || commandName === t('commons:all')) {
      embed
        .setTitle('**Sebedius – Year Zero Discord Bot**')
        .setDescription(`${this.bot.config.wikiURL}#list-of-commands`);

      // Hides ownerOnly commands.
      const commands = this.bot.commands.filter(c => !c.ownerOnly);

      for (const [cat, code] of Object.entries(SebediusCommand.CategoryFlagsBits)) {
        const category = `commands:categories.${cat.toLowerCase()}`;
        const cmds = commands.filter(c => c.category === code);
        const cmdLines = [...cmds
          .mapValues(c => {
            return inlineCode(`/${c.data.name_localizations?.[t.lng] || c.name}`)
              + ` – ${c.data.description_localizations?.[t.lng] || c.description}`;
          })
          .values(),
        ].join('\n');

        if (cmds.size) {
          embed.addFields({
            name: t(category),
            value: cmdLines,
            inline: false,
          });
        }
      }
    }
    // Help message for one specific command.
    else {
      let command = this.bot.commands.get(commandName);
      if (!command) command = this.bot.commands.find(c => c.data.name_localizations?.[t.lng] === commandName);

      if (!command) {
        return interaction.reply({
          content: `${this.bot.config.Emojis.shrug} ${t('commands:help.commandNotFound', {
            cmd: inlineCode(commandName),
          })}`,
          ephemeral: true,
        });
      }

      // Gets the localized description.
      let commandDescription = command.data.description_localizations?.[t.lng];
      if (!commandDescription) commandDescription = command.description;

      embed
        .setTitle(inlineCode(`/${commandName}`))
        .setDescription(commandDescription);

      if (command.data.options?.length) {
        embed.addFields(...getCommandOptionsEmbedFields(command, t));
      }

      // embed.addFields({
      //   name: 'Wiki',
      //   value: `${this.bot.config.wikiURL}/%21${commandName}`,
      // });
    }
    await interaction.reply({ embeds: [embed] });
  }
};

/**
 * @param {SebediusCommand & any} command
 * @param {SebediusCommand.SebediusTranslationCallback} t 
 */
function getCommandOptionsEmbedFields(command, t) {
  const fields = [];
  if (typeof command.data.options[0]?.options !== 'undefined') {
    // Has subcommands.
    for (const subcommand of command.data.options) {
      fields.push({
        name: `/${command.name} ${subcommand.name}`,
        value: (subcommand.description_localizations?.[t.lng] || subcommand.description)
          + (subcommand.options?.length ? `\n${getCommandOptionsDescription(subcommand.options, t)}` : ''),
      });
    }
  }
  else {
    fields.push({
      name: t('commands:help.arguments'),
      value: getCommandOptionsDescription(command.data.options, t),
    });
  }
  return fields;
}

function getCommandOptionsDescription(commandOptions, t) {
  const out = [];
  for (const commandOption of commandOptions) {
    out.push(getArgumentDescription(commandOption, t));
  }
  return trimString(out.join('\n'), 1024);
}

function getArgumentDescription(commandOption, t) {
  return `${inlineCode(commandOption.name_localizations?.[t.lng] || commandOption.name)}`
    + ` – ${commandOption.required ? `*(${t('commands:help.required')})* ` : ''}`
    + (commandOption.description_localizations?.[t.lng] || commandOption.description);
}
