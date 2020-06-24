const { Collection } = require('discord.js');
const Util = require('../utils/Util');
const YZInitDeck = require('./YZInitDeck');
const YZCombattant = require('./YZCombattant');

module.exports = class InitTracker {

	/**
	 * Creates an Initiative Tracker.
	 * @param {string} name The name for the Combat instance
	 * @param {Discord.Snowflake} id The message's ID
	 */
	constructor(name, id) {
		this.id = id || 0;
		this.name = name || 'Unnamed';
		this.round = 0;
		this.initiative = 0;
		this.initiativeDeck = new YZInitDeck();

		/**
		 * K: init / V: Array<(YZCombattant.id | groupName)>
		 * The initiative is stored as a float number whose decimal helps splitting same init values.
		 * @type {Discord.Collection<number, (Symbol|string)[]>}
		 */
		this.initiatives = new Collection();

		/**
		 * K: YZCombattant.id / V: YZCombattant
		 * @type {Discord.Collection<Symbol, YZCombattant>}
		 */
		this.combattants = new Collection();

		/**
		 * K: groupName / V: YZCombattant.id[]
		 * @type {Discord.Collection<string, Symbol[]>}
		 */
		this.groups = new Collection();
	}

	/**
	 * The names of all the groups.
	 * @type {string[]}
	 */
	get groupNames() {
		return [...this.groups.keys()];
	}

	/**
	 * Adds a Combattant or a Group to the initiative.
	 * @param {number[]} inits An array of initiatives values
	 * @param {Symbol<number>|string} iid The Combattant's ID or the group's name
	 */
	addInit(inits, iid) {
		// Validators.
		if (!Array.isArray(inits)) throw new InitError(`Add-Init: "${inits}" are not valid initiatives!`);
		if (typeof iid !== 'symbol' && typeof iid !== 'string') throw new InitError(`Add-Init: "${iid}" is not a valid object!`);

		// Iterates over all initiative values.
		for (const init of inits) {
			// Validator again.
			if (typeof init !== 'number') throw new InitError(`Add-Init: "${init}" is not a valid initiative!`);
			// Creates the initiative slot if it doesn't exist.
			if (!this.initiatives.has(init)) this.initiatives.set(init, []);
			// Adds the object.
			const items = this.initiatives.get(init);
			items.push(iid);
			this.initiatives.set(init, items);
		}
		this.log();
	}

	/**
	 * Adds a Combattant to this Initiative Tracker.
	 * @param {*} data Data
	 * @param {?number[]} initiativeValues Predefined initiative values
	 */
	addCombattant(data, initiativeValues = null) {
		// Creates and adds the Combattant.
		const combattant = new YZCombattant(data);
		this.combattants.set(combattant.id, combattant);
		// Draws initiative.
		const inits = initiativeValues || this.drawInit(combattant.speed);
		this.addInit(inits, combattant.id);
	}

	removeCombattant() {

	}

	editCombattant(combattant, property, value) {
		if (!combattant.hasOwnProperty(property)) throw new InitError(`Edit Combattant: "${property}" property not found!`);
	}

	/**
	 * Creates a group.
	 * @param {string} group The name of the group
	 * @param {number} speed The quantity of drawn initiative cards
	 */
	createGroup(group, speed = 1) {
		// Checks if the group already exist.
		if (this.groups.has(group)) {
			console.log(`Create Group: "${group}" already exists.`);
			return false;
		}
		// Otherwise, creates the group.
		this.groups.set(group, []);
		// And draws its initiative.
		const init = this.drawInit(speed);
		for (const card of init) {
			this.set(Symbol(card), group);
		}
		this.log();
	}

	deleteGroup(group) {
		// Exists early if the group doesn't exist.
		if (!this.groups.has(group)) return false;
		// Retrieve the initiative of the group.
		const init = this.initiatives.findKey()
		const del1 = this.groups.delete(group);
		const del2 = this.sweep(grp => this.groupNames.includes[grp]/*, this*/);
		this.sort();
		console.log('Deleted? ', del1, 'Removed from init: ', del2);
		this.log();
	}

	/**
	 * Adds a Combattant to a group.
	 * The group is created if it didn't exist.
	 * @param {YZCombattant} combattant The combattant to add to a group
	 * @param {string} group The name of the group
	 */
	addCombattantToGroup(combattant, group) {
		// Creates the group if it doesn't exist.
		if (!this.groups.has(group)) this.createGroup(group);
		// Adds the combattant to the group.
		const grp = this.groups.get(group);
		grp.push(combattant.id);
		this.groups.set(group, grp);
		this.log();
	}

	/**
	 * Remove a Combattant from a group.
	 * @param {Symbol} cid Combattant's ID.
	 * @param {string} group The name of the group
	 * @returns {boolean} `true` if removed, `false` if not found in group
	 */
	removeCombattantFromGroup(cid, group) {
		// Exits early and returns `false` if the group doesn't exist.
		if (!this.groups.has(group)) return false;
		// Gets the group.
		const grp = this.groups.get(group);
	}

	editInit() {

	}

	/**
	 * Draws initiative cards.
	 * @param {number} qty The quantity of initiative cards to draw
	 * @return {number[]}
	 */
	drawInit(qty = 1) {
		// Min 1 card, Max 10 cards.
		const drawQty = Util.clamp(qty, 1, 10);

		// If more cards are drawn that the remaining number,
		// draws the remaining cards and shuffle a new deck for the lasts.
		const size = this.initiativeDeck.size;
		let cards;
		if (drawQty <= size) {
			cards = this.initiativeDeck.draw(drawQty);
		}
		else {
			const remainingCards = this.initiativeDeck.draw(size);
			this.initiativeDeck = new YZInitDeck();
			const extraCards = this.drawInit(drawQty - size);
			cards = remainingCards.concat(extraCards);
		}
		// Always returns an array.
		if (!cards) throw new InitError('Cards are null');
		if (!Array.isArray(cards)) return [cards];
		return cards;
	}

	sortByInit() {

	}

	printList() {
		const start = '```markdown\n';
		const title = `Current initiative: ${this.initiative} (round ${this.round})`;
		const end = '\n```';
	}

/*	sort() {
		this.sort((init1, init2) => init1 - init2);
	}//*/
	log() {
		console.log(this);
		console.log(this.initiatives.keys());
		console.log(this.combattants.keys());
		console.log(this.groups.keys());
	}
};

class InitError extends Error {}