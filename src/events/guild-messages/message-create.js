const SebediusEvent = require('../../structures/event');

module.exports = class MessageCreateEvent extends SebediusEvent {
  name = 'messageCreate';
  /** @type {SebediusEvent.SebediusEventMessageCreateFunction} */
  async execute(message) {
    if (message.author.bot) return;
  }
};
