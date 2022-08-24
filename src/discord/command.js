const { SlashCommandBuilder } = require('discord.js');

/**
 * @callback SebediusCommandRunCallback
 * @param {import('discord.js').CommandInteraction} interaction
 */

module.exports = class SebediusCommand extends SlashCommandBuilder {
  /**
   * Sets the run command's action.
   * @param {SebediusCommandRunCallback} fn
   * @returns {this}
   */
  setAction(fn) {
    /**
     * The run callback of the command.
     * @type {SebediusCommandRunCallback}
     * @function
     */
    this.run = fn;

    return this;
  }
};
