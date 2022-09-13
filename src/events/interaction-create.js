const i18next = require('i18next');
const { codeBlock, inlineCode } = require('discord.js');
const SebediusEvent = require('../structures/event');
const { YearZeroGames } = require('../constants');
const { Emojis } = require('../config');
const { RollError } = require('../utils/errors');
const Logger = require('../utils/logger');

module.exports = class InteractionCreateEvent extends SebediusEvent {
  name = 'interactionCreate';

  /** @type {SebediusEvent.SebediusEventInteractionCreateFunction} */
  async execute(interaction) {
    // 1. Gets the guild options from the database (game & locale).
    //      If not inGuild, it will return an object with a default game.
    const guildOptions = await this.getGuildOptions(interaction);

    // 2. Defines the translation callback.
    const locale =
      guildOptions.locale ||
      interaction.guildLocale ||
      interaction.locale ||
      this.bot.config.defaultLocale;
    const t = global.t = i18next.getFixedT(locale);

    // 3. Chat Input Command
    if (interaction.isChatInputCommand()) {

      // 3.1 Logs the interaction.
      this.logInteraction(interaction);

      // 3.2. Promisifies the command count.
      if (process.env.NODE_ENV === 'production') {
        this.bot.database.incrementCommand(interaction); // Do not await
      }

      // 3.3. Gets the command.
      const command = this.bot.commands.get(interaction.commandName);
      if (!command) {
        return interaction.reply({
          content: `${Emojis.error} Command does not exist!`,
          ephemeral: true,
        });
      }

      // 3.4. Runs the command.
      try {
        if (['roll', 'rolld66', 'crit'].includes(command.name)) {
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
        const content = `${Emojis.error} ${t('commons:commandError', {
          name: inlineCode(err.name),
          code: err.code ? `(${err.code})` : '',
          message: codeBlock('js', err.message),
        })}`;

        if (!(err instanceof RollError)) {
          this.bot.webhookManager.sendLog(content, interaction);
        }

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

      // 3.5. Checks permissions (put after because we only have 3 seconds to respond to an interaction).
      this.checkPermissions(interaction, t);
    }
  }

  /**
   * Logs the interaction in the console.
   * @param {import('@structures/command').SebediusCommandInteraction} interaction
   * @returns {string} The log message
   */
  logInteraction(interaction) {
    let logMsg = `${interaction.commandName} • ${interaction.user.tag} (${interaction.user.id})`;
    if (interaction.inGuild()) {
      logMsg += ` # ${interaction.channel.name} (${interaction.channelId})`
        + ` @ ${interaction.guild.name} (${interaction.guild.id})`;
    }
    else {
      logMsg += '@ DM';
    }
    Logger.command(logMsg);
    return logMsg;
  }

  /**
   * Gets the options of the guild from the database.
   * @param {import('@structures/command').SebediusCommandInteraction} interaction 
   * @returns {Promise.<import('@structures/command').GuildOptions>}
   */
  async getGuildOptions(interaction) {
    let guildOptions = {};
    if (interaction.inGuild() && this.bot.database.isReady()) {
      // @ts-ignore
      guildOptions = await this.bot.database.guilds.findById(
        interaction.guildId,
        null,
        { upsert: true, lean: true },
      ) || {};
      if (guildOptions?.isBanned) return this.bot.leaveBanned(interaction.guild);
    }
    if (!guildOptions.game) guildOptions.game = YearZeroGames.MUTANT_YEAR_ZERO;
    return guildOptions;
  }

  // TODO check permissions
  async checkPermissions(interaction, t) {
    if (interaction.inGuild()) {
      // const botMember = await interaction.guild.members.fetchMe();
      const botMember = interaction.guild.members.me;
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

        // if (interaction.replied) await interaction.followUp({ content: msg, ephemeral: true });
        // else if (interaction.deferred) await interaction.editReply({ content: msg });
        // else await interaction.reply({ content: msg, ephemeral: true });
      }
    }
  }
};

function logErrorOnError(e, verb) {
  Logger.error(`${Emojis.boom} An error occurred ${verb} on an error`);
  console.error(e);
}
