/**
 * @callback SebediusEventExecuteCallback
 * @param {import('./client.js')} client
 * @param {*} [...args]
 * @returns {*|Promise}
 */

module.exports = class SebediusEvent {
  /**
   * @param {Object}   options             Event options
   * @param {string}   options.name        The name of the event
   * @param {boolean} [options.once=false] Whether the event is run only once (default is false)
   * @param {SebediusEventExecuteCallback} options.execute The callback function to execute
   */
  constructor({ name, once = false, execute }) {

    /**
     * The name of the event.
     * @type {string}
     */
    this.name = name;

    /**
     * Whether the event is run only once.
     * @type {boolean}
     */
    this.once = once;

    /**
     * The callback function to execute.
     * @type {SebediusEventExecuteCallback}
     */
    this.execute = execute;
  }
};
