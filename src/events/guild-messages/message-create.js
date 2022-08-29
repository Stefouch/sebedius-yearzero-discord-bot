const SebediusEvent = require('../../structures/event');

module.exports = class MessageCreateEvent extends SebediusEvent {
  name = 'messageCreate';
  /** @type {SebediusEvent.SebediusEventMessageCreateCallback} */
  async execute(client, message) {
    if (message.author.bot) return;
  }
};
