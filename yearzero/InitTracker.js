const { Collection } = require('discord.js');
const Util = require('../utils/Util');
const YZInitDeck = require('./YZInitDeck');
const YZCombattant = require('./YZCombattant');
const { isInteger } = require('lodash');

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
		return [...this.groups.keys()].sort();
	}

	/**
	 * Adds a Combattant or a Group to the initiative list.
	 * @param {number[]} inits An array of initiative values
	 * @param {Symbol|string} iid The Combattant's ID or the group's name
	 */
	addInit(inits, iid) {
		// Validators.
		if (!Array.isArray(inits)) throw new InitError(`Add-Init: "${inits}" are not valid initiatives!`);
		this.checkIID(iid, 'Add-Init');

		// Iterates over all initiative values.
		for (const init of inits) {
			// Validator again.
			if (typeof init !== 'number') throw new InitError(`Add-Init: "${init}" is not a valid initiative!`);
			// Creates the initiative slot if it doesn't exist.
			// Adds a float to avoid duplicates.
			const i = Number.isInteger(init) ? init + 0.05 : init + 0.001;
			if (this.initiatives.has(i)) {
				// Run again if it already exists.
				// It will result in adding extra decimals.
				this.addInit([i], iid);
			}
			else {
				this.initiatives.set(i, iid);
			}
		}
	}

	/**
	 * Create a new Combattant and adds it to the collection.
	 * @param {*} data A YZCombattant object or the data required to create the Combattant
	 * @returns {Symbol} The Combattant's ID
	 */
	createCombattant(data) {
		// Creates and adds the Combattant.
		const combattant = data instanceof YZCombattant ? data : new YZCombattant(data);
		this.combattants.set(combattant.id, combattant);
		return combattant.id;
	}

	/**
	 * Edits a Combattant in the collection.
	 * @param {Symbol} cid The Combattant's ID
	 * @param {string} property The property to edit
	 * @returns {Symbol} The Combattant's ID, or `null` if not found
	 */
	editCombattant(cid, newData) {
		// Validators
		this.checkCID(cid, 'Edit-Combattant');
		if (!this.combattants.has(cid)) return null;

		// Gets the Combattant.
		const combattant = this.combattants.gets(cid);
		//if (!combattant.hasOwnProperty(property)) throw new InitError(`Edit-Combattant: "${property}" property not found!`);
	}

	/**
	 * Adds a Combattant to this Initiative Tracker.
	 * @param {*} data Data required to create the Combattant
	 * @param {?number[]} initiativeValues Predefined initiative values
	 */
	addCombattant(data, initiativeValues = null) {
		// Creates and adds the Combattant.
		const combattant = new YZCombattant(data);
		this.combattants.set(combattant.id, combattant);
		// Draws initiative.
		const inits = initiativeValues || this.drawInit(combattant.speed);
		this.addInit(inits, combattant.id);
		this.log();
	}

	removeCombattant(iid) {
		// Validator.
		if (!this.isValidInitID(iid)) throw new InitError(`Remove-Combattant: "${iid}" not a valid IID!`);
		if (!this.combattants.has(iid)) return 0;

		// Removes the Combattant from the collection of combattants.
		this.combattants.delete(iid);

		// Removes the Combattant from the initiative order.
		const qtyRemoved = this.initiatives.sweep(v => v === iid);
		// If it was removed from there, it can't be in a group and we skip that part.
		if (qtyRemoved > 0) return qtyRemoved;

		// Removes the Combattant from any group.
		if (this.groups.some(v => v.includes[iid])) {
			const group = 
		}
		this.log();
	}


	/**
	 * Creates a group.
	 * @param {string} group The name of the group
	 * @param {number} speed The quantity of drawn initiative cards
	 */
	createGroup(group, speed = 1) {
		// Checks if the group already exist.
		if (this.groups.has(group)) return;

		// Otherwise, creates the group.
		this.groups.set(group, []);
		// And draws its initiative.
		const inits = this.drawInit(speed);
		this.addInit(inits, group);
		this.log();
	}

	deleteGroup(group) {
		// Exists early if the group doesn't exist.
		if (!this.groups.has(group)) return false;
		// Retrieve the initiative of the group.
		const del1 = this.groups.delete(group);
		const del2 = this.sweep(grp => this.groupNames.includes[grp]/*, this*/);
		this.sort();
		console.log('Deleted? ', del1, 'Removed from init: ', del2);
		this.log();
	}

	/**
	 * Adds a Combattant to a group.
	 * The group is created if it didn't exist.
	 * @param {Symbol} cid The Combattant's ID.
	 * @param {string} group The name of the group
	 */
	addCombattantToGroup(cid, group) {
		// Validator.
		if (!this.isValidInitID(cid)) throw new InitError(`Add-Combattant-To-Group: "${cid}" is not a valid Combattant's ID!`);
		if (!this.combattants.has(cid)) throw new InitError(`Add-Combattant-To-Group: "${cid}" does not exist!`);

		// Removes the combattant from other groups

		// Creates the group if it doesn't exist.
		if (!this.groups.has(group)) this.createGroup(group);

		// Adds the combattant to the group.
		const grp = this.groups.get(group);
		grp.push(cid);
		this.groups.set(group, grp);

		this.log();
	}

	/**
	 * Remove a Combattant from a group and adds it to the initiative order.
	 * @param {Symbol} cid The Combattant's ID.
	 * @param {string} group The name of the group
	 * @returns {boolean} `true` if removed, `false` if not found in group
	 */
	removeCombattantFromGroup(cid, group) {
		// Validators.
		if (!this.isValidInitID(cid)) throw new InitError(`Remove-Combattant-From-Group: "${cid}" is not a valid Combattant's ID!`);
		if (!this.groups.has(group)) return false;

		// Gets the initiative of the whole group.
		const init = 

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

	/**
	 * Tells if this is a valid Combattant's ID.
	 * @param {Symbol} cid The ID to check
	 * @returns {boolean}
	 */
	isValidCombattantID(cid) {
		const isSymbol = typeof cid === 'symbol';
		if(isSymbol) {
			const descriptor = cid.description;
			const isStringDescriptor = typeof descriptor === 'string';
			if(isStringDescriptor) return descriptor.length === 4;
		}
		return false;
	}
	
	/**
	 * Tells if this is a valid Initiative ID (Combattant or group).
	 * @param {Symbol|string} iid The ID to check
	 * @returns {boolean}
	 */
	isValidInitID(iid) {
		return (this.isValidCombattantID(iid) || typeof iid === 'string');
	}

	/**
	 * Checks CID or Die!
	 * @param {Symbol} cid The Combattant's ID
	 * @param {string} fnName The name of the function
	 * @throws {InitError}
	 */
	checkCID(cid, fnName = '') {
		if (!this.isValidCombattantID(cid)) {
			throw new InitError(`${fnName}: "${cid}" is not a valid Combattant's ID!`);
		}
	}

	/**
	 * Checks IID or Die!
	 * @param {Symbol} iid The Combattant's ID or the group's name
	 * @param {string} fnName The name of the function
	 * @throws {InitError}
	 */
	checkIID(iid, fnName = '') {
		if (!this.isValidInitID) {
			throw new InitError(`${fnName}: "${iid}" is not a valid ID!`);
		}
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