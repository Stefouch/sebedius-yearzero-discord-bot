const { MessageEmbed } = require('discord.js');
const ReactionMenu = require('./ReactionMenu');
const { clamp } = require('./Util');

class PageMenu {
	/**
	 * Create a menu with navigable pages.
	 * Stop deletes the menu message.
	 * @param {Discord.Message} ctx Discord message with context.
	 * @param {?Discord.MessageEmbed[]} pages An array of page objects.
	 */
	constructor(ctx, pages = [new MessageEmbed({ title: 'Default Page' })]) {
		this.ctx = ctx;
		this.client = ctx.bot;
		this.userID = ctx.author.id;
		this.pages = pages;
		this.currentPage = pages[0];
		this.page = 0;
		this.reactionMenu = null;
		this.collector = null;

		ctx.channel.send(this.currentPage)
			.then(menu => {
				this.menu = menu;
				this.react();
			});
	}

	get size() { return this.pages.length; }

	static get ICON_PREVIOUS() { return '⬅'; }
	static get ICON_NEXT() { return '➡'; }
	static get ICON_STOP() { return '⏹'; }

	setPage(page = 0) {
		this.page = page;
		this.currentPage = this.pages[this.page];
		this.menu.edit(this.currentPage);
	}

	react() {
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
		reactions.push({
			icon: PageMenu.ICON_STOP,
			owner: this.userID,
			fn: async () => this.stop(),
		});
		this.reactionMenu = new ReactionMenu(this.menu, this.client, 180000, reactions);
		this.collector = this.reactionMenu.collector;
	}

	next() { this.goto(this.page + 1); }
	previous() { this.goto(this.page - 1); }
	goto(page = 0) {
		if (page >= 0 && page < this.size) {
			this.setPage(page);
		}
		else {
			page = clamp(page, 0, this.size);
			this.setPage(page);
		}
	}

	async stop() {
		try {
			this.collector.stop('noclear');
			await this.menu.delete();
		}
		catch(err) { console.error(err); }
	}
}

module.exports = PageMenu;