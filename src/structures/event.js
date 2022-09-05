/**
 * @callback SebediusEventMessageCreateFunction
 * @param {import('discord.js').Message} message
 * @returns {Promise.<any>}
 */

/**
 * @callback SebediusEventInteractionCreateFunction
 * @param {import('./command').SebediusCommandInteraction} interaction
 * @returns {Promise.<any>}
 */

/**
 * @typedef {Object} SebediusEventOptions
 * @property {string}   name        The name of the event
 * @property {boolean} [once=false] Whether the event is run only once (default is false)
 */

/* ------------------------------------------ */

/**
 * Sebedius Event.
 */
class SebediusEvent {
  /**
   * @param {import('./sebedius-client')} client
   * @param {SebediusEventOptions}       [options]
   */
  constructor(client, options) {
    /**
     * The bot client.
     * @type {import('./sebedius-client')}
     */
    this.client = client;

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
   * The bot client.
   * @alias this.client
   * @readonly
   */
  get bot() {
    return this.client;
  }

  /**
   * The method executed by the event.
   * @param {*} args
   * @returns {Promise.<any>}
   * @abstract
   */
  // eslint-disable-next-line no-unused-vars
  async execute(...args) {
    throw new SyntaxError('Execute Function Must Be Implemented!');
  }
};

module.exports = SebediusEvent;
