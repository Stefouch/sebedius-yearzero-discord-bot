const SebediusEvent = require('../../structures/event');
const Logger = require('../../utils/logger');

module.exports = class GuildCreateEvent extends SebediusEvent {
  name = 'guildCreate';
  async execute(client, guild) {
    const total = client.guilds.cache.size;
    const msg = `✔ Guild #${total} | Joined: ${guild.name} (${guild.id})`;
    Logger.event(msg);
  }
};
