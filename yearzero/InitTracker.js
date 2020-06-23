const Discord = require('discord.js');
const Util = require('../utils/Util');
const YZInitDeck = require('../yearzero/YZInitDeck');
const YZCombattant = require('./YZCombattant');

module.exports = class InitTracker extends Discord.Collection {
	constructor(name) {
		super();
		this.id = 0;
		this.name = name || 'Unnamed';
		this.round = 0;
		this.initiative = 0;
		this.initiativeDeck = new YZInitDeck();
		this.combattants = new Discord.Collection();
		this.groups = new Discord.Collection();
	}

	addCombattant(data) {
		const combattant = new YZCombattant(data);
		const init = this.drawInit(combattant.speed);
		this.combattants.set(combattant.id, combattant);
		for (const card of init) {
			this.set(card, combattant.id);
		}
	}

	addGroup(name, speed) {
		const init = this.drawInit(speed);
		for (const card of init) {
			this.set(card, name);
		}
	}

	addCombattantToGroup(combattant, group) {
		combattant.group = group;
	}

	drawInit(qty = 1) {
		const drawQty = Util.clamp(qty, 1, 10);
		if (drawQty > this.initiativeDeck.size) this.initiativeDeck = new YZInitDeck();
		const cards = this.initiativeDeck.draw(drawQty);
		if (!Array.isArray(cards)) return [cards];
		return cards;
	}

	printList() {
		const start = '```markdown\n';
		const title = `Current initiative: ${this.initiative} (round ${this.round})`;
		const end = '\n```';
	}
};