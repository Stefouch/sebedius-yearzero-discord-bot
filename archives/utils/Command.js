/**
 * A Discord custom Command.
 */
class Command {
	/**
	 * The command information
	 * @typedef {Object} CommandInfo
	 * @property {string} name The name of the command, same as its file name
	 * @property {string[]} aliases All aliases for the command
	 * @property {string} category The Command's category
	 * @property {string} description The description of the command
	 * @property {string[][]} moreDescriptions Extra description for the command
	 * @property {boolean} ownerOnly Whether the command is only available for the bot's owner
	 * @property {boolean} guildOnly Whether the command is only available in a Guild channel
	 * @property {boolean} args Whether the command must be provided with arguments
	 * @property {string} usage string describing the command usage
	 */

	/**
	 * @param {CommandInfo} info
	 */
	constructor(info) {
		/**
		 * The name of the command, same as its file name.
		 * @type {string}
		 */
		this.name = info.name || '???';

		/**
		 * All aliases for the command.
		 * @type {string[]}
		 */
		this.aliases = info.aliases || [];

		/**
		 * The Command's category.
		 * @type {string}
		 */
		this.category = info.category || 'common';

		/**
		 * The description of the command.
		 * @type {string}
		 */
		this.description = info.description || '???';

		/**
		 * Extra description for the command.
		 * @type {string[][]}
		 */
		this.moreDescriptions = info.moreDescriptions;

		/**
		 * Whether the command is only available for the bot's owner.
		 * @type {boolean}
		 */
		this.ownerOnly = info.ownerOnly ? true : false;

		/**
		 * Whether the command is only available in a Guild channel.
		 * @type {boolean}
		 */
		this.guildOnly = info.guildOnly ? true : false;

		/**
		 * Whether the command must be provided with arguments.
		 * @type {boolean}
		 */
		this.args = info.args ? true : false;

		/**
		 * A string describing the command usage
		 * @type {string}
		 */
		this.usage = info.usage || '';
	}

	/**
	 * Runs/executes the command.
	 * @param {string[]} args Command's arguments
	 * @param {import('../utils/ContextMessage')} ctx Discord message with context
	 * @namespace
	 * @async
	 */
	// eslint-disable-next-line no-unused-vars
	async run(args, ctx) {
		throw new SyntaxError('Not Implemented');
	}
}

module.exports = Command;