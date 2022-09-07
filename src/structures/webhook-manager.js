const { WebhookClient, EmbedBuilder, inlineCode, codeBlock } = require('discord.js');
const { convertDate } = require('../utils/discord-utils');
const { trimString } = require('../utils/string-utils');
const Logger = require('../utils/logger');

class WebhookManager {
  constructor(client, logWebhookURL) {
    /** @type {import('./sebedius-client')} */
    this.client = client;
    /** @type {string} */
    this.logs = logWebhookURL;
  }

  async guildCreate(guild) {
    const embed = this.#createGuildEmbed(guild, `${this.client.config.Emojis.sparkles} Sebedius joined a new server!`);
    const webhook = new WebhookClient({ url: this.logs });
    await webhook.send({ embeds: [embed] }).catch(Logger.error);
  }

  async guildDelete(guild) {
    const embed = this.#createGuildEmbed(guild, '🚪 Sebedius was kicked from a server!');
    const webhook = new WebhookClient({ url: this.logs });
    await webhook.send({ embeds: [embed] }).catch(Logger.error);
  }

  /**
   * @param {string} message
   * @param {import('./command').SebediusCommandInteraction} [interaction]
   */
  async sendLog(message, interaction) {
    if (process.env.NODE_ENV !== 'production') return;
    const webhook = new WebhookClient({ url: this.logs });

    let embed;
    if (interaction) {
      embed = new EmbedBuilder()
        .setTitle('Interaction information')
        .setColor('#f00')
        .setTimestamp()
        .setDescription(
          `👤 **User:** ${inlineCode(interaction.user.tag)} (${inlineCode(interaction.user.id)})`
          + `\n🏛️ **Guild:** ${inlineCode(interaction.guild?.name)} (${inlineCode(interaction.guild?.id)})`
          + `\n↙️ **Command:** ${inlineCode(interaction.commandName)}`,
        )
        .addFields({
          name: 'Options',
          value: codeBlock('json', trimString(JSON.stringify(interaction.options, null, ' '), 1000)),
        });
    }
    await webhook.send({
      content: message,
      embeds: embed ? [embed] : [],
    }).catch(Logger.error);
  }

  /**
   * @param {import('discord.js').Guild} guild
   * @param {string} title
   */
  #createGuildEmbed(guild, title) {
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setTimestamp()
      .setDescription(
        `**Name:** ${inlineCode(guild.name)}`
        + `\n**ID:** ${inlineCode(guild.id)}`
        + `\n**Created At:** ${convertDate(guild.createdTimestamp)}`
        + `\n**Member Count:** ${guild.memberCount}`,
      );

    if (guild.banner) embed.setImage(guild.bannerURL());

    return embed;
  }

  // ? Idea for automatic webhook creation, but was abandoned to reduce the number of permissions needed.
  // async getWebhook(channelId, name, create = false) {
  //   const channel = await this.client.getChannel(channelId);
  //   if (channel && channel.type === ChannelType.GuildText) {
  //     const webhooks = await channel.fetchWebhooks();
  //     let webhook = webhooks.find(w => {
  //       if (w.client.user.id === this.client.id &&
  //         w.name === name) return true;
  //     });
  //     if (webhook) return webhook;
  //     if (create) {
  //       await channel.createWebhook({
  //         name,
  //         avatar: this.client.user.defaultAvatarURL,
  //       })
  //         .catch(wh => {
  //           Logger.client('📣 Webhook | create:'
  //             + ` ${wh.name} (${wh.id})`
  //             + ` in # ${channel.name} (${channel.id})`
  //             + ` @ ${channel.guild.name} (${channel.guild.id})`);
  //           return wh;
  //         })
  //         .catch(Logger.error);
  //       return webhook;
  //     }
  //     else {
  //       return undefined;
  //     }
  //   }
  //   else {
  //     Logger.error(`WebhookManagerError: Channel ${channelId} does not exist or is not in a guild!`);
  //   }
  // }

  // async getLogWebhook() {
  //   return this.getWebhook(this.logChannelId, WebhookManager.LOG_WEBHOOK_NAME, true);
  // }
}

// WebhookManager.LOG_WEBHOOK_NAME = 'Sebedius Logs';
// WebhookManager.NEWS_WEBHOOK_NAME = 'Sebedius News';

module.exports = WebhookManager;
