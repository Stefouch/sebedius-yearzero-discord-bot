const SebediusEvent = require('../structures/event');
const Logger = require('../utils/logger');

module.exports = class GuilDeleteEvent extends SebediusEvent {
  name = 'guildDelete';
  async execute(guild) {
    const msg = `🚪 Guild | Left: ${guild.name} (${guild.id})`;
    Logger.event(msg);
    this.bot.webhookManager.guildDelete(guild);
    await this.bot.database.guilds.findByIdAndUpdate(
      guild.id,
      { $currentDate: { leaveTimestamp: true } },
      { upsert: true, new: true, lean: true },
    );
  }
};
