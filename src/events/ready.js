const { ActivityType } = require('discord.js');
const SebediusEvent = require('../structures/event');
const loopActivities = require('../structures/presence');
const Logger = require('../utils/logger');

module.exports = class ReadyEvent extends SebediusEvent {
  name = 'ready';
  once = true;
  async execute() {
    if (!this.bot.shard) {
      return Logger.client(`✅ Sebedius v${this.bot.version} with sharding disabled`);
    }
    Logger.client(`✅ Sebedius v${this.bot.version} shard ${this.bot.shard.ids} is ready!`);
    Logger.client(`  ├ Logged in as: ${this.bot.user.tag} (${this.bot.user.id})`);
    Logger.client(`  └ # Guilds: ${this.bot.guilds.cache.size}`);

    if (this.bot.shard.ids.includes(this.bot.shard.count - 1)) {
      /** @type {number[]} */ // @ts-ignore
      const guildCounts = await this.bot.shard.fetchClientValues('guilds.cache.size');
      const guildTotal = guildCounts.reduce((sum, n) => sum + n, 0);
      this.bot.webhookManager.sendLog(
        `👨‍🔬 **Sebedius** v${this.bot.version} is \`ready\` ! (\`${guildTotal}\` guilds)`
        + ` - ${this.bot.shard.count} shards`,
      );

      // Sets presence.
      this.bot.user.setActivity({
        name: `v${this.bot.version}`,
        type: ActivityType.Playing,
      });
      this.bot.activity = loopActivities(this.bot);
    }
  }
};
