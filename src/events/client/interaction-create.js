const i18next = require('i18next');
const { codeBlock, inlineCode } = require('discord.js');
const SebediusEvent = require('../../structures/event');
const Logger = require('../../utils/logger');
const { YearZeroGames } = require('../../constants');
const { Emojis } = require('../../config');

module.exports = class InteractionCreateEvent extends SebediusEvent {
  name = 'interactionCreate';

  /** @type {SebediusEvent.SebediusEventInteractionCreateFunction} */
  async execute(interaction) {
    const guild = interaction.guild;

    let guildOptions = {};
    if (this.bot.database.isReady()) {
      // @ts-ignore
      guildOptions = await this.bot.database.grabGuild(guild);
      if (guildOptions?.isBanned) return this.bot.leaveBanned(guild);
    }
    if (!guildOptions.game) guildOptions.game = YearZeroGames.MUTANT_YEAR_ZERO;
    if (!guildOptions.locale) guildOptions.locale = this.bot.config.defaultLocale;

    const locale = guildOptions?.locale || guild.preferredLocale;
    const t = global.t = i18next.getFixedT(locale);

    if (interaction.isChatInputCommand()) {
      // Logs the command.
      const logMsg = `${interaction.commandName}`
        + ` • ${interaction.user.tag} (${interaction.user.id})`
        + ` # ${interaction.channel.name} (${interaction.channelId})`
        + ` @ ${guild.name} (${guild.id})`;
      Logger.command(logMsg);

      // TODO autocomplete for /help <command>
      // if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
      //   console.log('in');
      //   const focusedOption = interaction.options.getFocused(true);
      //   let choices;
      //   if (interaction.commandName === 'help' && focusedOption.name === 'command') {
      //     choices = this.bot.commands.map(c => c.name);
      //   }
      //   const filteredChoices = choices.filter(c => c.startsWith(focusedOption.value));
      //   await interaction.respond(filteredChoices.map(c => ({ name: c, value: c })));
      // }

      const command = this.bot.commands.get(interaction.commandName);
      if (!command) {
        return interaction.reply({
          content: `${Emojis.error} Command does not exist!`,
          ephemeral: true,
        });
      }

      // Runs the command.ù
      try {
        if (['roll', 'rolld66', 'crit'].includes(command.name)) {
          // TODO clean or keep
          // const guildOptions = await this.bot.database.grabGuild(interaction.guildId);
          // @ts-ignore
          await command.run(interaction, t, guildOptions);
        }
        else {
        // @ts-ignore
          await command.run(interaction, t);
        }
      }
      catch (err) {
        Logger.error(err);
        const content = `${Emojis.error} An error occured with this command: ${inlineCode(err.name)}`
          + (err.code ? `(${err.code})` : '')
          + `\n${codeBlock('js', err.message)}`;

        if (interaction.replied) {
          await interaction.followUp({ content, ephemeral: true })
            .catch(e => logErrorOnError(e, 'following up'));
        }
        else if (interaction.deferred) {
          await interaction.editReply({ content })
            .catch(e => logErrorOnError(e, 'following up'));
        }
        else {
          await interaction.reply({ content, ephemeral: true })
            .catch(e => logErrorOnError(e, 'replying'));
        }
      }

      // Checks permissions (put after because we only have 3 seconds to respond to an interaction).
      const botMember = await interaction.guild.members.fetchMe();
      if (!botMember.permissions.has(this.bot.permissions)) {
        const missingPermsList = botMember.permissions
          .missing(this.bot.permissions)
          .join(', ');
          // TODO Message for missing permissions
        // const msg = `${Emojis.warning} ${t('commons:missingPermissionsError', {
        //   member: botMember.toString(),
        //   perms: codeBlock(missingPermsList),
        // })}`;
        Logger.warn(`Missing permissions: ${missingPermsList}`);
        // return interaction.reply(msg);
      }
    }
  }
};

function logErrorOnError(e, verb) {
  Logger.error(`${Emojis.boom} An error occurred ${verb} on an error`);
  console.error(e);
}
