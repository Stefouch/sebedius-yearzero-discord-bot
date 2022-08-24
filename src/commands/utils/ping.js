const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const SebediusCommand = require('../../discord/command.js');

module.exports = new SebediusCommand()
  .setName('ping')
  .setDescription('Pings the bot')
  .setAction(interaction => runPing(interaction));

async function runPing(interaction) {
  const client = interaction.client;
  const embed = new EmbedBuilder()
    .setTitle('🏓 Pong!')
    .setThumbnail(client.user.displayAvatarURL())
    .addFields(
      { name: 'Latency', value: `\`${client.ws.ping}ms\``, inline: true },
      { name: 'Uptime', value: `<t:${parseInt(client.readyTimestamp / 1000)}:R>`, inline: true },
    )
    .setTimestamp()
    .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

  interaction.reply({ embeds: [embed] });
}
