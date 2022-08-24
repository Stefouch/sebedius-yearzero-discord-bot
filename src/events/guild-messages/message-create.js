const SebediusEvent = require('../../discord/event');

module.exports = new SebediusEvent({
  name: 'messageCreate',
  /**
   * @param {import('@discord/client')} client 
   * @param {import('discord.js').Message} message 
   */
  execute(client, message) {
    // Exits early is the message was send by a bot
    // and prevents bot from responding to its own messages.
    if (message.author.bot) return;
  },
});
