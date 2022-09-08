const { ActivityType } = require('discord.js');
const SebediusEvent = require('../structures/event');
const loopActivities = require('../structures/presence');
const Logger = require('../utils/logger');

module.exports = class ReadyEvent extends SebediusEvent {
  name = 'ready';
  once = true;
  async execute() {
    Logger.client('✅ Sebedius is ready!');
    Logger.client(`  ├ Logged in as: ${this.bot.user.tag} (${this.bot.user.id})`);
    Logger.client(`  └ # Guilds: ${this.bot.guilds.cache.size}`);

    this.bot.webhookManager.sendLog(`👨‍🔬 **Sebedius** is \`ready\` ! (\`${this.bot.guilds.cache.size}\` guilds)`);

    // Sets presence.
    this.bot.user.setActivity({
      name: `v${this.bot.version}`,
      type: ActivityType.Playing,
    });
    this.bot.activity = loopActivities(this.bot);
  }
};
