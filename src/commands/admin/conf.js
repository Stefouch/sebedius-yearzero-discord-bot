const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, codeBlock } = require('discord.js');
const SebediusCommand = require('../../structures/command');
const { YearZeroGameChoices } = require('../../constants');
const { Emojis, SupportedLocales } = require('../../config');
const { isObjectEmpty } = require('../../utils/object-utils');
const Logger = require('../../utils/logger');

module.exports = class ConfCommand extends SebediusCommand {
  constructor(client) {
    super(client, {
      category: SebediusCommand.CategoryFlagsBits.ADMIN,
      data: new SlashCommandBuilder()
        .setName('conf')
        .setDescription('Sets the bot\'s configuration for this server.')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(opt => opt
          .setName('game')
          .setDescription('Define the default game for your server (for dice skins and critical injuries tables)')
          .addChoices(...YearZeroGameChoices))
        .addStringOption(opt => opt
          .setName('locale')
          .setDescription('Define the default language for your server (see Readme for details)')
          .addChoices(...SupportedLocales)),
    });
  }
  /** @type {SebediusCommand.SebediusCommandRunFunction} */
  async run(interaction, t) {
    if (!this.bot.database.isReady()) {
      return interaction.reply({
        content: `${Emojis.stop} ${t('commands:conf:databaseNotReadyError')}`,
        ephemeral: true,
      });
    }
    await interaction.deferReply({ ephemeral: true });

    const game = interaction.options.getString('game');
    const locale = interaction.options.getString('locale');

    const updateData = {};
    if (game) updateData.game = game;
    if (locale) updateData.locale = locale;
    let guildDocument;

    if (!isObjectEmpty(updateData)) {
      guildDocument = await this.bot.database.guilds.findByIdAndUpdate(
        interaction.guildId,
        updateData,
        { projection: 'game locale', lean: true, new: true },
      );
      Logger.client(`📝 Database | update: Guild ${interaction.guildId} with ${JSON.stringify(updateData)}`);
    }
    else {
      guildDocument = await this.bot.database.guilds.findById(
        interaction.guildId,
        'game locale',
        { lean: true },
      );
    }

    const fields = [];
    for (const [k, v] of Object.entries(guildDocument)) {
      if (k && k !== '_id' && v) {
        let emoji;
        switch (k) {
          case 'game': emoji = Emojis.die; break;
          case 'locale': emoji = Emojis.locale; break;
          default: emoji = Emojis.ok;
        }
        fields.push({
          name: `${emoji} ${t(`commands:conf.options.${k}`)}`,
          value: codeBlock(v),
          inline: true,
        });
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(t('commands:conf.title'))
      .setDescription(interaction.guild.name)
      .setColor(this.bot.config.favoriteColor)
      .addFields(...fields)
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  }
};
