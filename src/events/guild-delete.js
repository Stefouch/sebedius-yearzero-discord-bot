const SebediusEvent = require('../structures/event');
const Logger = require('../utils/logger');

module.exports = class GuildCreateEvent extends SebediusEvent {
  name = 'guildDelete';
  async execute(guild) {
    const total = this.bot.guilds.cache.size;
    const msg = `🚪 Guild #${total} | Left: ${guild.name} (${guild.id})`;
    Logger.event(msg);
    await this.bot.database.grabGuild(guild, {
      leaveTimestamp: Date.now(),
    });
  }
};
