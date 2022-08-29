/**
 * @callback SebediusEventMessageCreateCallback
 * @param {import('./sebedius-client')} client
 * @param {import('discord.js').Message} message
 * @returns {Promise.<any>}
 * @async
 */

/**
 * @callback SebediusEventInteractionCreateCallback
 * @param {import('./sebedius-client')} client
 * @param {import('discord.js').BaseInteraction} interaction
 * @returns {Promise.<any>}
 * @async
 */

/**
 * @typedef {Object} SebediusEventOptions
 * @property {string}   name        The name of the event
 * @property {boolean} [once=false] Whether the event is run only once (default is false)
 */

/**
 * Sebedius Event.
 */
class SebediusEvent {

  /**
   * @param {SebediusEventOptions} [options]
   */
  constructor(options) {

    /**
     * The name of the event.
     * @type {string}
     */
    this.name = options?.name;

    /**
     * Whether the event is run only once.
     * @type {boolean}
     */
    this.once = options?.once ?? false;
  }

  /**
   * The method executed by the event.
   * @param {import('./sebedius-client')} client
   * @param {*} args
   * @returns {Promise.<any>}
   * @abstract
   * @async
   */
  // eslint-disable-next-line no-unused-vars
  async execute(client, ...args) {
    throw new SyntaxError('Run Function Must Be Implemented!');
  }
};

module.exports = SebediusEvent;
