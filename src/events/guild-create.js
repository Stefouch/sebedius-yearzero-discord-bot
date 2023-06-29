const SebediusEvent = require('../structures/event');
const Logger = require('../utils/logger');

module.exports = class GuildCreateEvent extends SebediusEvent {
  name = 'guildCreate';
  async execute(guild) {
    const msg = `✨ Guild | Joined: ${guild.name} (${guild.id})`;
    Logger.event(msg);
    this.bot.webhookManager.guildCreate(guild);
    const guildOptions = await this.bot.database.guilds.findByIdAndUpdate(
      guild.id,
      { $currentDate: { joinTimestamp: true } },
      { upsert: true, new: true, lean: true },
    );
    if (guildOptions?.isBanned) return this.bot.leaveBanned(guild);
  }
};
