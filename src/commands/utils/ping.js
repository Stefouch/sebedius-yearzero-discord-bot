const { EmbedBuilder, codeBlock, SlashCommandBuilder } = require('discord.js');
const SebediusCommand = require('../../structures/command');
const { relativeTimestamp, absoluteTimestamp } = require('../../utils/discord-utils');

module.exports = class PingCommand extends SebediusCommand {
  constructor(client) {
    super(client, {
      category: SebediusCommand.CategoryFlagsBits.UTILS,
      data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Display the Sebedius\' latency'),
    });
  }
  /** @type {SebediusCommand.SebediusCommandRunFunction} */
  async run(interaction) {
    const bot = interaction.client;
    const msg = await interaction.reply({
      content: 'Pinging...',
      fetchReply: true,
    });
    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setThumbnail(bot.user.displayAvatarURL())
      .addFields({
        name: 'Latency API',
        value: codeBlock(`${bot.ws.ping}ms`),
        inline: true,
      }, {
        name: 'Latency BOT',
        value: codeBlock(`${msg.createdTimestamp - interaction.createdTimestamp}ms`),
        inline: true,
      }, {
        name: 'Uptime',
        value: `${absoluteTimestamp(bot.readyTimestamp)}\n(${relativeTimestamp(bot.readyTimestamp)})`,
        inline: true,
      })
      .setTimestamp()
      .setFooter({
        text: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL(),
      });

    interaction.editReply({ content: null, embeds: [embed] });
  }
};
