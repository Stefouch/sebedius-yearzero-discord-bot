const { ActivityType } = require('discord.js');
const SebediusEvent = require('../structures/event');
const loopActivities = require('../structures/presence');
const Logger = require('../utils/logger');

module.exports = class ReadyEvent extends SebediusEvent {
  name = 'ready';
  once = true;
  async execute() {
    if (process.env.NODE_ENV !== 'production') await this.registerCommands();

    Logger.client('✔ Sebedius is ready!');
    Logger.client(`  ├ Logged in as: ${this.bot.user.tag} (${this.bot.user.id})`);
    Logger.client(`  └ # Guilds: ${this.bot.guilds.cache.size}`);

    // Sets presence.
    this.bot.user.setActivity({
      name: `v${this.bot.version}`,
      type: ActivityType.Playing,
    });
    this.bot.activity = loopActivities(this.bot);
  }
  async registerCommands() {
    const devGuild = await this.bot.guilds.cache.get(process.env.BOT_GUILD_ID);
    devGuild.commands.set(this.bot.commands.map(cmd => cmd.data));
  }
};
