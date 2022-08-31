const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, inlineCode } = require('discord.js');
const SebediusCommand = require('../../structures/command');
const { YearZeroGameChoices } = require('../../constants');
const { capitalize } = require('../../utils/string-utils');

module.exports = class PingCommand extends SebediusCommand {
  constructor(client) {
    super(client, {
      category: SebediusCommand.CategoryFlagsBits.ADMIN,
      data: new SlashCommandBuilder()
        .setName('conf')
        .setDescription('Sets the bot\'s configuration for this server.')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => sub
          .setName('game')
          .setDescription('Define the default game for your server (for ice skins and critical injuries tables)')
          .addStringOption(opt => opt
            .setName('value')
            .setDescription('Input')
            .addChoices(...YearZeroGameChoices)))
        .addSubcommand(sub => sub
          .setName('locale')
          .setDescription('Define the default language for your server (see Readme for details)')
          .addStringOption(opt => opt
            .setName('value')
            .setDescription('Input')
            .addChoices({
              name: 'English',
              value: 'en',
            }))),
    });
  }
  /** @type {SebediusCommand.SebediusCommandRunFunction} */
  async run(interaction, t) {
    const key = interaction.options.getSubcommand();
    let value = interaction.options.getString('value');

    await interaction.deferReply({ ephemeral: true });

    if (value) {
      await this.bot.database.setGuild(interaction.guild, { [key]: value });
    }
    else {
      value = (await this.bot.database.getGuild(interaction.guildId)).get(key);
    }

    let emoji = '';
    switch (key) {
      case 'game': emoji = '🎲'; break;
      case 'locale': emoji = '🌍'; break;
    }

    const embed = new EmbedBuilder()
      .setTitle(t('commands:conf.title', {
        guild: interaction.guild.name,
      }))
      .setDescription(`${emoji} **${capitalize(key)}** = ${inlineCode(value)}`)
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  }
};
