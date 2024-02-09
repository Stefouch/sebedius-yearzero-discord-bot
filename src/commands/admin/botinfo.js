const os = require('node:os');
const ms = require('ms');
const worker = require('core-worker');
const { SlashCommandBuilder, EmbedBuilder, version } = require('discord.js');
const SebediusCommand = require('../../structures/command');

module.exports = class BotInfoCommand extends SebediusCommand {
  constructor(client) {
    super(client, {
      ownerOnly: true,
      category: SebediusCommand.CategoryFlagsBits.ADMIN,
      data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Display information about the bot process'),
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

    await interaction.deferReply({ ephemeral:true });

    const channelCount = (await this.bot.shard.fetchClientValues('this.bot.channels.cache.size'))
      // @ts-ignore
      .reduce((n, sum) => sum + n, 0);
    const emojiCount = (await this.bot.shard.fetchClientValues('this.bot.emojis.cache.size'))
      // @ts-ignore
      .reduce((n, sum) => sum + n, 0);

    const npmv = await worker.process('npm -v').death();
    const embed = new EmbedBuilder()
      .setTitle('`Sebedius Statistics`')
      .setTimestamp()
      .addFields({
        name: 'Memory Usage',
        value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
        inline: true,
      }, {
        name: 'Swap Partition Size',
        value: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
        inline: true,
      }, {
        name: 'Uptime',
        value: ms(this.bot.uptime),
        inline: true,
      }, {
        name: 'Users',
        value: '' + await this.bot.getUserCount(),
        inline: true,
      }, {
        name: 'Servers',
        value: '' + await this.bot.getGuildCount(),
        inline: true,
      }, {
        name: 'Channels',
        value: '' + channelCount,
        inline: true,
      }, {
        name: 'Emojis',
        value: '' + emojiCount,
        inline: true,
      }, {
        name: 'Library',
        value: 'discord.js',
        inline: true,
      }, {
        name: 'Library Version',
        value: `v${version}`,
        inline: true,
      }, {
        name: 'Bot Created',
        value: '' + this.bot.user.createdAt,
        inline: true,
      }, {
        name: 'Node Version',
        value: process.version,
        inline: true,
      }, {
        name: 'NPM Version',
        value: npmv.data.replace('\n', ''),
        inline: true,
      }, {
        name: 'OS',
        value: `${os.platform()} (${process.arch})`,
        inline: true,
      });

    return interaction.editReply({ embeds: [embed] });
  }
};
