const Util = require('../utils/Util');
const YZInitiative = require('./YZInitiative');

class YZCombat {

	constructor(channelId, summaryMessageId, dmId,
		options, message, combatants,
		roundNum = 0, turnNum = 0, currentIndex = null,
	) {
		this.channel = channelId;
		this.summary = summaryMessageId;
		this.dm = dmId;
		this.options = options || {};
		this.round = roundNum || 0;
		this.turn = turnNum || 0;
		this.index = currentIndex || 0;
		// this.message = message;

		/**
		 * Combatants.
		 * @type {YZCombatant[]}
		 */
		this.combatants = combatants || [];

		/**
		 * Initiative slots.
		 * K: {number} initiative value.
		 * V: {string} Combatant's ID.
		 * @type {Discord.Collection<number, string>}
		 */
		this.initiatives = new YZInitiative();
	}

	/**
	 * The combatant whose turn it currently is.
	 * @returns {YZCombatant}
	 */
	currentCombatant() {
		const ref = this.initiatives.get(this.index);
		if (ref) {
			return this.combatants.find(c => c.id === ref);
			// return this.combatants.find(c => c.index === this.index);
		}
		return null;
	}

	/**
	 * The combatant whose turn it will be when advanceTurn() is called.
	 * @returns {YZCombatant}
	 */
	nextCombatant() {
	//	let index;
	//	const clen = this.combatants.length;
	//	if (clen === 0) return null;
	//	if (!this.index) index = 0;
	//	else if (this.index + 1 >= clen) index = 0;
	//	else index = this.index + 1;

		const ref = this.initiatives.next(this.index);
		if (ref) {
			return this.combatants.find(c => c.id === ref);
		}
		return null;

		/* let index;
		const clen = this.combatants.length;
		if (clen === 0) return null;
		if (!this.index) index = 0;
		else if (this.index + 1 >= clen) index = 0;
		else index = this.index + 1;
		return this.combatants.find(c => c.index === index);
		//*/
	}

	/**
	 * Returns a list of all Combatants in a combat.
	 * @param {?boolean} [returnGroups=false] Whether to return YZCombatantGroup objects in the list
	 * @return {YZCombatant[]} A list of all combatants (and optionally groups)
	 */
	getCombatants(returnGroups = false) {
		let combatants = [];
		for (const c of this.combatants) {
			if (!(c instanceof YZCombatantGroup)) {
				combatants.push(c);
			}
			else {
				combatants = combatants.concat(c.getCombatants());
				if (returnGroups) combatants.push(c);
			}
		}
		return combatants;
	}

	addCombatant(combatant) {
		this.combatants.push(combatant);
		this.sortCombatants();
	}

	removeCombatant(combatant, ignoreRemoveHook = false) {
		if (!ignoreRemoveHook) combatant.onRemove();
		if (!combatant.group) {
			this.combatants = this.combatants.filter(c => c.id !== combatant.id);
			this.sortCombatants();
		}
		else {
			this.getGroup(combatant.group).removeCombatant(combatant);
			this.checkEmptyGroups();
		}
		return this;
	}

	sortCombatants() {
		let currentCombatant = this.currentCombatant();
		const fn = (ca, cb) => ca.inits[0] - cb.inits[0];
		this.combatants = this.combatants.sort(fn);
		for (let i = 0; i < this.combatants.length; i++) {
			this.combatants[i].index = i;
		}
		if (currentCombatant) {
			this.currentIndex = currentCombatant.index;
			this.turn = currentCombatant.inits[0];
		}
	}

	getCombatant() {
	}
}

class YZCombatant {

	constructor(message, data) {
		if(!message) throw new Error('YZCombattant has no controller');

		/**
		 * The unique ID of this Combattant.
		 * @name YZCombatant#id
		 * @type {string}
		 * @readonly
		 */
		Object.defineProperty(this, 'id', {
			value: data.id || Util.randomID(),
			enumerable: true,
		});

		/**
		 * Discord Message that asked for the creation of this Combattant.
		 * @type {Discord.Message}
		 */
		// this.message = message;
		this.controller = data.controller || message.author.id;

		this._name = data.name || `Unnamed Character "${Util.randomID(4)}"`;
		this.hp = +data.hp || 2;
		this.armor = +data.armor || 0;
		this.speed = +data.speed || 1;
		this.hidden = data.hidden ? true : false;
		this.private = data.private ? true : false;
		// this.stats = data.stats || {};
		// this.skills = data.skills || {};
		// this.status = YZCombatant.STATUS_LIST[0];
		this.notes = data.notes || '';

		this.inits = data.inits || [0];

		/**
		 * Combat write only; Position in combat
		 * @type {number}
		 */
		this.index = data.index || 0;
		this.group = data.group;
	}

	get name() { return this._name; }
	set name(newName) { this._name = newName; }

	get maxhp() { return this._maxhp; }
	set maxhp(newMaxHp) {
		this._maxhp = newMaxHp;
		if (!this.hp) this.hp = newMaxHp;
	}

	/**
	 * Returns a string representation of the combatant's HP.
	 * @param {?boolean} [privacy=false] Whether to return the full revealed stats or not
	 * @returns {string}
	 */
	hpString(privacy = false) {
		let hpStr = '';
		if (!(this.isPrivate() || privacy)) {
			hpStr = `<${this.hp}${this.maxhp ? `/${this.maxhp}` : ''} HP>`;
		}
		else if (this.maxhp > 0) {
			const ratio = this.hp / this.maxhp;
			if (ratio <= 0) hpStr += '<Broken>';
		}
		return hpStr;
	}

	/**
	 * Gets a short summary of a combatant's status.
	 * @param {number} init The initiative value
	 * @param {?boolean} [privacy=false] Whether to return the full revealed stats or not
	 * @param {?boolean} [hideNotes=false] Wether to Hide notes or not
	 * @returns {string} A string describing the combatant
	 */
	getSummary(init, privacy = false, hideNotes = false) {
		const hpStr = this.hpString(privacy);
		const hp = hpStr ? `${hpStr} ` : '';
		if (!hideNotes) {
			return `${Util.zeroise(init, 2)}: ${this.name} ${hp}${this.getEffectsAndNotes()}`;
		}
		else {
			return `${Util.zeroise(init, 2)}: ${this.name} ${hp}`;
		}
	}

	/**
	 * Gets the start-of-turn status of a combatant.
	 * @param {boolean} [privacy=false] Whether to return the full revealed stats or not
	 * @returns {string} A string describing the combatant
	 */
	getStatus(privacy = false) {
		const name = this.name;
		const hpar = this.getHpAndAr(privacy);
		const notes = this.notes ? `\n# ${this.notes}` : '';
		return `${name} ${hpar} ${notes}`.trim();
	}

	getEffectsAndNotes() {
		const out = [];
		if (this.armor && !this.isPrivate()) out.push(`AR ${this.armor}`);
		if (this.notes) out.push(this.notes);
		if (out.length) return out.join(', ');
		return '';
	}

	getHpAndAr(privacy = false) {
		const out = [this.hpString(privacy)];
		if (this.armor && !(this.isPrivate() || privacy)) {
			out.push(`AR ${this.armor}`);
		}
		return out.join(' ');
	}

	isPrivate() {
		return this.private;
	}

	controllerMention() {
		return `<@${this.controller}>`;
	}

	/**
	 * Called when the combatant is removed from combat, either through !i remove or the combat ending.
	 */
	onRemove() {
		// Things to do.
	}

	/**
	 * A method called at the start of each of the combatant's turns.
	 * @param {?number} [numTurns=1] The number of turns that just passed
	 */
	onTurnUpkeep(numTurns = 1) {
		// Things to do.
	}

	/**
	 * A method called at the end of each of the combatant's turns.
	 * @param {?number} [numTurns=1] The number of turns that just passed
	 */
	onTurnEnd(numTurns = 1) {
		// Things to do.
	}

	toString() {
		return `${this.name}: ${this.hpString()}`.trim();
	}

	toHash() {
		return Util.hashCode(`${this.name}.${this.id.toString()}`);
	}

	/**
	 * @type {string[]}
	 * @readonly
	 *
	static get STATUS_LIST() {
		return ['Healhty', 'Broken', 'Dead'];
	}//*/
}

class YZCombatantGroup extends YZCombatant {

	constructor(message, name, combatants, inits) {
		super(message, { inits });
		this._name = name || `Group ${Util.randomID(4)}`;
		this.combatants = combatants || [];
	}

	get name() { return this._name; }
	set name(newName) {
		this._name = newName;
		for (const combatant of this.combatants) {
			combatant.group = this.name;
		}
	}

	addCombatant(combatant) {
		combatant.group = this.name;
		combatant.inits = this.inits;
		this.combatants.push(combatant);
	}

	removeCombatant(combatant) {
		this.combatants = this.combatants.filter(c => c !== combatant);
	}

	getSummary(init, privacy = false, hideNotes = false) {
		let status = '';
		const clen = this.combatants.length;
		if (clen > 7 && !privacy) {
			status = `${Util.zeroise(init, 2)}: ${this.name} (${clen} combatant${clen > 1 ? 's' : ''})`;
		}
		else {
			status = `${Util.zeroise(init, 2)}: ${this.name}`;
			for (const c of this.combatants) {
				const summary = c.getSummary(privacy, hideNotes).split(': ');
				summary.shift();
				status += `\n     - ${summary.join(': ')}`;
			}
		}
		return status;
	}

	getStatus(privacy = false) {
		const statusList = this.combatants.map(c => c.getStatus(privacy));
		return statusList.join('\n');
	}

	contains(item) {
		return this.combatants.includes(item);
	}

	toString() {
		const clen = this.combatants.length;
		return `${this.name} (${clen} combatant${clen > 1 ? 's' : ''})`;
	}

}

module.exports = { YZCombat, YZCombatant, YZCombatantGroup };