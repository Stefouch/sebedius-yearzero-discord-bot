const { MessageEmbed } = require('discord.js');
const ReactionMenu = require('./ReactionMenu');
const { clamp } = require('./Util');

class PageMenu {
	/**
	 * Create a menu with navigable pages.
	 * Stop deletes the menu message.
	 * @param {Discord.Message} channel Discord message with context
	 * @param {string} userID (Snowflake) The ID of the user you want to let control the menu
	 * @param {?number} [time=120000] Cooldown (in milliseconds)
	 * @param {?Discord.MessageEmbed[]} pages An array of page objects
	 * @param {?ReactionMenu#ReactionData} reactionData Use this if you want to customize the next, previous and stop reactions
	 */
	constructor(channel, userID, time = 120000, pages = [new MessageEmbed({ title: 'Default Page' })], reactionData = {}) {
		this.channel = channel;
		this.time = time;
		this.userID = userID;
		this.pages = pages;
		this.currentPage = pages[0];
		this.page = 0;
		this.reactionMenu = null;

		channel.send(this.currentPage)
			.then(menu => {
				this.menu = menu;
				this.react(reactionData);
			});
	}

	get size() { return this.pages.length; }

	static get ICON_PREVIOUS() { return '⬅'; }
	static get ICON_NEXT() { return '➡'; }
	static get ICON_STOP() { return '⏹'; }

	/**
	 * Sets the current page.
	 * @param {number} page Page number
	 */
	setPage(page = 0) {
		this.page = page;
		this.currentPage = this.pages[this.page];
		this.menu.edit(this.currentPage);
	}

	/**
	 * Adds the reactions' menu.
	 * @param {ReactionMenu#ReactionData} reactionData
	 */
	react(reactionData) {
		const reactions = [];
		if (this.size > 1) {
			reactions.push({
				icon: PageMenu.ICON_PREVIOUS,
				owner: this.userID,
				fn: () => this.previous(),
			},
			{
				icon: PageMenu.ICON_NEXT,
				owner: this.userID,
				fn: () => this.next(),
			});
		}
		if (reactionData.stop) {
			reactions.push(reactionData.stop);
		}
		else {
			reactions.push({
				icon: PageMenu.ICON_STOP,
				owner: this.userID,
				fn: async () => this.stop(),
			});
		}
		this.reactionMenu = new ReactionMenu(this.menu, this.time, reactions);
	}

	/**
	 * Sets the current page to the next one.
	 */
	next() { this.goto(this.page + 1); }

	/**
	 * Sets the current page to the previous one.
	 */
	previous() { this.goto(this.page - 1); }

	/**
	 * Sets the current page (checks validity).
	 * @param {number} page Page number
	 */
	goto(page = 0) {
		if (page >= 0 && page < this.size) {
			this.setPage(page);
		}
		else {
			page = clamp(page, 0, this.size);
			this.setPage(page);
		}
	}

	/**
	 * Stops the collector and deletes the message.
	 * @async
	 */
	async stop() {
		try {
			this.reactionMenu.stop('noclear');
			await this.menu.delete();
		}
		catch(err) { console.error('[ReactionMenu.Stop] An error occured', err); }
	}
}

module.exports = PageMenu;