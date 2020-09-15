const { Message } = require('discord.js');
const Util = require('./Util');

/**
 * Creates a Reaction Menu for a message.
 */
class ReactionMenu {
	/**
	 * @typedef ReactionData
	 * An object containing the data needed to create a reaction.
	 * @property {string} icon The desired emoji
	 * @property {?string} owner User ID of the only person that can react to this emoji, if any
	 * @property {function} fn Callback function with collector parameter, to perform when clicked
	 */

	/**
	 * @param {import('discord.js').Message} message Discord message to attach the reaction menu
	 * @param {number} time Cooldown (in milliseconds)
	 * @param {ReactionData[]} reactionsData An array of objects containing the data needed to create the reactions
	 */
	constructor(message, time, reactionsData) {
		/**
		 * @type {import('discord.js').Message}
		 */
		this.message = message;

		/**
		 * @type {import('discord.js').TextChannel}
		 */
		this.channel = this.message.channel;

		/**
		 * @type {import('discord.js').User}
		 */
		this.bot = this.message.author;

		/**
		 * Cooldown in milliseconds.
		 * @type {number}
		 */
		this.time = time || 120000;

		/**
		 * The collector associated with this menu.
		 * @type {import('discord.js').Collector}
		 */
		this.collector = null;

		/**
		 * An array with all reactions and their actions.
		 * @type {Map<string, ReactionData>}
		 */
		this.reactions = new Map();
		for (const reaction of reactionsData) {
			if (Util.isObject(reaction)) {
				if (!reaction.hasOwnProperty('icon') || !reaction.hasOwnProperty('fn')) {
					throw new ReactionMenuError('Improper reaction object!');
				}
				this.reactions.set(reaction.icon, { owner: reaction.owner, fn: reaction.fn });
			}
		}
		this.addReactions();
		this.createCollector();
	}

	/**
	 * List of all emojis in this menu.
	 * @type {string[]}
	 */
	get emojis() {
		return [...this.reactions.keys()];
	}

	/**
	 * Tells if it's a DM Channel.
	 * @type {boolean}
	 */
	get isDM() {
		return this.channel.type === 'dm';
	}

	/**
	 * Creates the collector associated with this menu.
	 */
	createCollector() {
		// Checks Permissions (not possible in DM).
		if (!this.isDM) {
			if (!this.channel.permissionsFor(this.bot).has('READ_MESSAGE_HISTORY')) throw new ReactionMenuError('Missing READ_MESSAGE_HISTORY permission!');
			if (!this.channel.permissionsFor(this.bot).has('MANAGE_MESSAGES')) throw new ReactionMenuError('Missing MANAGE_MESSAGES permission!');
		}
		// Adds a ReactionCollector to the push icons.
		// The filter is for reacting only to the push icon and the user who rolled the dice.
		const filter = (reac, user) => this.emojis.includes(reac.emoji.name) && user.id !== this.bot.id;
		this.collector = this.message.createReactionCollector(filter, { time: this.time });

		// ========== Listener: On Collect ==========
		this.collector.on('collect', (reac, user) => {
			if (this.reactions.has(reac.emoji.name)) {
				const reaction = this.reactions.get(reac.emoji.name);
				if (!reaction.owner || (reaction.owner === user.id)) {
					// Launches the stored callback function.
					reaction.fn(this.collector);
				}
			}
			// Then removes that added emoji (not possible in DM).
			if (!this.isDM) {
				reac.users.remove(user)
					.catch(err => console.warn('[ReactionMenuError] Failed to remove user\'s reaction.', err.name, err.code));
			}
		});

		// ========== Listener: On End ==========
		this.collector.on('end', (collected, reason) => {
			// Actions for specific reasons.
			if (reason instanceof Message) {
				return reason.delete()
					.catch(err => console.warn('[ReactionMenuError] Failed to delete the reason message.', err.name, err.code));
			}
			// Removes all emojis (not possible in DM).
			if (!this.message.deleted && !this.isDM) {
				this.message.reactions.removeAll()
					.catch(err => console.warn('[ReactionMenuError] Failed to clear all reactions.', err.name, err.code));
			}
		});
	}

	/**
	 * Adds all reactions to the menu.
	 * @async
	 */
	async addReactions() {
		for (const emoji of this.emojis) {
			// If "await" is omitted, the emojis are added in a random order.
			await this.message.react(emoji)
				.catch(err => console.warn('[ReactionMenuError] An emoji cannot be added.', err.name, err.code, emoji));
		}
	}

	/**
	 * Stops the collector.
	 * @param {string} reason The reason the collector is ended
	 */
	stop(reason) {
		this.collector.stop(reason);
	}
}

module.exports = ReactionMenu;

class ReactionMenuError extends Error {
	constructor(msg) {
		super(msg);
		this.name = 'ReactionMenuError';
	}
}