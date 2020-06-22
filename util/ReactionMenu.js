const Discord = require('discord.js');
const Util = require('./Util');

class ReactionMenu {
	constructor(message, client, time, reactionsData) {
		/**
		 * @type {Discord.Message}
		 */
		this.message = message;

		/**
		 * @type {Discord.TextChannel}
		 */
		this.channel = this.message.channel;

		/**
		 * @type {Discord.User}
		 */
		this.bot = this.message.author;

		/**
		 * @type {Discord.Client}
		 */
		this.client = client;

		/**
		 * Cooldown in milliseconds.
		 * @type {number}
		 */
		this.time = time || 120000;

		/**
		 * An array with all reactions and their actions
		 * @type {Object[]}
		 * @property {string} icon The emoji
		 * @property {?number} owner User ID of the only person that can react to this emoji, if any
		 * @property {function} fn Callback function with collector parameter, to perform when clicked
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
			// Then remove that added emoji (not possible in DM).
			if (!this.isDM) {
				reac.users.remove(user)
					.catch(error => console.error(error));
			}
		});

		// ========== Listener: On End ==========
		this.collector.on('end', (collected, reason) => {
			// Remove all emojis (not possible in DM).
			if (!this.message.deleted && !this.isDM) {
				this.message.reactions.removeAll()
					.catch(error => console.error('ReactionMenuError: Failed to clear reactions!', error));
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
				.catch(error => console.error('ReactionMenuError: An emoji cannot be added!', emoji, error));
		}
	}
}

module.exports = ReactionMenu;

class ReactionMenuError extends Error {}