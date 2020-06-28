const Util = require('../utils/Util');
const YZInitiative = require('./YZInitiative');

class YZCombat {

	constructor(channelId, summaryMessageId, dmId,
		options, message, combatants,
		roundNum = 0, currentIndex = null,
	) {
		this.channel = channelId;
		this.summary = summaryMessageId;
		this.dm = dmId;
		this.options = options || {};
		this.round = roundNum || 0;
		this.index = currentIndex || 0;
		this.message = message;

		/**
		 * Combatants.
		 * @type {YZCombatant[]}
		 */
		this.combatants = combatants || [];

		/**
		 * Initiative slots.
		 * K: {number} initiative value.
		 * V: {string} Combatant's ID.
		 * @type {YZInitiative<number, string>}
		 */
		this.initiatives = new YZInitiative();
	}

	get turn() {
		return Math.floor(this.index);
	}

	/**
	 * The combatant whose turn it currently is.
	 * @type {YZCombatant}
	 * @readonly
	 */
	get currentCombatant() {
		const ref = this.initiatives.get(this.index);
		if (ref) {
			return this.combatants.find(c => c.id === ref);
			// return this.combatants.find(c => c.index === this.index);
		}
		return null;
	}

	/**
	 * The combatant whose turn it will be when advanceTurn() is called.
	 * @type {YZCombatant}
	 * @readonly
	 */
	get nextCombatant() {
		const nextInit = this.initiatives.next(this.index);
		const ref = this.initiatives.get(nextInit);
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

	static async fromId(channelId, message, bot) {
		if (bot.combats.has(channelId)) {
			return bot.combats.get(channelId);
		}
		else {
			const raw = await bot.kdb.get(channelId, 'combat');
			if (!raw) {
				throw new CombatNotFound(channelId);
			}
			const instance = YZCombat.fromRaw(raw, message);
			return instance;
		}
	}

	static fromRaw(raw, message) {
		const instance = new YZCombat(
			raw.channel,
			raw.summary,
			raw.dm,
			raw.options,
			message,
			raw.combatants,
			raw.round,
			raw.index,
		);
		for (const c of raw.combatants) {
			if (c.type === 'common') {
				instance.combatants.push(YZCombatant.fromRaw(c, message, instance));
			}
			else if (c.type === 'group') {
				instance.combatants.push(YZCombatantGroup.fromRaw(c, message, instance));
			}
			else {
				throw new CombatException('Unknown Combatant Type');
			}
		}
		return instance;
	}

	toRaw() {
		return {
			channel: this.channel,
			summary: this.summary,
			dm: this.dm,
			options: this.options,
			combatants: this.combatants.map(c => c.toRaw()),
			round: this.round,
			index: this.index,
		};
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
		//combatant.inits = this.initiatives.drawInit(combatant.speed);
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
		// Removes unused initiative slots.
		this.initiatives.sweep((ref, slot) => {
			const combatant = this.combatants.find(c => c.id === ref);
			return !combatant.inits.includes(Math.floor(slot));
		});

		// Adds missing initiative slots.
		this.combatants.forEach(c => {
			let draw = c.speed - c.inits.length;
			c.inits.forEach(init => {
				const hasInit = this.initiatives.some((ref, slot) => init === Math.floor(slot));
				if (!hasInit) draw++;
			});
			if (draw) {
				const drawnInits = this.initiatives.drawInit(draw);
				this.initiatives.addInitiative(c.id, drawnInits);
				c.inits = c.inits.concat(drawnInits);
			}
		});
		/* let currentCombatant = this.currentCombatant();
		const fn = (ca, cb) => ca.inits[0] - cb.inits[0];
		this.combatants = this.combatants.sort(fn);
		for (let i = 0; i < this.combatants.length; i++) {
			this.combatants[i].index = i;
		}
		if (currentCombatant) {
			this.currentIndex = currentCombatant.index;
			this.turn = currentCombatant.inits[0];
		}//*/
	}

	getCombatant(name, strict = true) {
		name = name.toLowerCase();
		if (strict) return this.getCombatants().find(c => c.name.toLowerCase() == name);
		else return this.getCombatants().find(c => c.name.toLowerCase().includes(name));
	}

	/**
	 * Gets a combatant group.
	 * @param {string} name The name of the combatant group
	 * @param {boolean} create The initiative to create a group at if a group is not found
	 * @param {boolean} strict Wether the group name must be a full case insensitive match
	 * @returns {YZCombatantGroup}
	 */
	getGroup(name, create = null, strict = true) {
		let grp;
		if (strict) {
			name = name.toLowerCase();
			grp = this.getGroups().find(g => g.name.toLowerCase() == name);
		}
		else {
			name = name.toLowerCase();
			grp = this.getGroups().find(g => g.name.toLowerCase().includes(name));
		}

		// Initiative "0" does not exist so it's good to test it like this.
		if (!grp && create) {
			grp = new YZCombatantGroup(name, create);
			this.addCombatant(grp);
		}
		return grp;
	}

	getGroups() {
		return this.combatants.filter(c => c instanceof YZCombatantGroup);
	}

	checkEmptyGroups() {
		let removed = 0;
		for (const c of this.combatants) {
			if (c instanceof YZCombatantGroup && c.getCombatants().length === 0) {
				this.removeCombatant(c);
				removed++;
			}
		}
		if (removed > 0) this.sortCombatants();
		return removed;
	}

	/**
	 * Opens a prompt for a user to select the combatant they were searching for.
	 * @param {string} name The name of the combatant to search for
	 * @param {Discord.Message} choiceMessage The message to pass to the selector
	 * @param {boolean} selectGroup Whether to allow groups to be selected
	 * @returns {YZCombatant} The selected Combatant, or None if the search failed
	 * @async
	 */
	async selectCombatant(name, choiceMessage = null, selectGroup = false) {
		name = name.toLowerCase();
		let matching = this.getCombatants(selectGroup).find(c => c.name.toLowerCase() == name);
		if (!matching) {
			matching = this.getCombatants(selectGroup).find(c => c.name.toLowerCase().includes(name));
		}
		return await this.getSelection(this.message, matching, choiceMessage);
	}

	/**
	 * Advances the turn. If any caveats should be noted, returns them in messages.
	 * @throws {NoCombatants} if `this.combatants` is empty
	 */
	advanceTurn() {
		if (this.combatants.length === 0) throw new NoCombatants();
		if (this.currentCombatant) this.currentCombatant.onTurnEnd();

		let changedRound = false;
		const nextInit = this.initiatives.next(this.index);

		// Start of combat.
		if (!this.index) {
			this.index = this.initiatives.min;
			this.round++;
		}
		// New round.
		else if (nextInit < this.index) {
			this.index = this.initiatives.min;
			this.round++;
			changedRound = true;
		}
		else {
			this.index = nextInit;
		}
		this.currentCombatant.onTurnUpkeep();
		return { changedRound, messages: [] };
	}

	rewindTurn() {
		if (this.combatants.length === 0) throw new NoCombatants();
		if (this.currentCombatant) this.currentCombatant.onTurnEnd();

		const previousInit = this.initiatives.previous(this.index);

		// Start of combat.
		if (this.index == null || this.index == undefined) {
			this.index = this.initiatives.max;
			// this.round--;
		}
		// New round.
		else if (previousInit > this.index) {
			this.index = this.initiatives.max;
			this.round--;
		}
		else {
			this.index = previousInit;
		}
	}

	gotoTurn(initNum, isCombatant = false) {
		if (this.combatants.length === 0) throw new NoCombatants();
		if (this.currentCombatant) this.currentCombatant.onTurnEnd();

		if (isCombatant) {
			if (initNum.group) {
				initNum = this.getGroup(initNum.group);
			}
			this.index = this.initiatives.findKey(ref => ref === initNum.id);
		}
		else {
			const target = Util.closest(initNum, this.initiatives.keyArray().sort());
			if (target) {
				this.index = target;
			}
			else {
				this.index = this.initiatives.min;
			}
		}
	}

	skipRounds(numRounds) {
		this.round += numRounds;
		for (const combatant of this.combatants) {
			combatant.onTurnUpkeep(numRounds);
			combatant.onTurnEnd(numRounds);
		}
	}

	getTurnString() {
		let nextCombatant = this.currentCombatant;
		let outStr = '';

		if (nextCombatant instanceof YZCombatantGroup) {
			const thisTurn = nextCombatant.getCombatants();
			outStr = `**Initiative ${this.turn} (round ${this.round})**: `
				+ `(${nextCombatant.name})\n`
				+ thisTurn.map(c => c.controllerMention()).join(', ')
				+ '```markdown\n'
				+ thisTurn.map(c => c.getStatus()).join('\n')
				+ '```';
		}
		else {
			outStr = `**Initiative ${this.turn} (round ${this.round})**: `
				+ `${nextCombatant.name} (${nextCombatant.controllerMention()})`
				+ '```markdown\n'
				+ nextCombatant.getStatus()
				+ '```';
		}
		if (this.options.turnnotif) {
			const nextTurn = this.nextCombatant;
			outStr += `**Next up:** ${nextTurn.name} (${nextTurn.controllerMention()})\n`;
		}
		return outStr;
	}

	static async ensureUniqueChan(message) {
		const bot = message.guild.me.client;
		const data = await bot.kdb.get(message.channel.id, 'combat');
		if (data) throw new ChannelInCombat();
	}

	/**
	 * Commits the combat to db.
	 * @async
	 */
	async commit() {
		if (!this.message) throw new RequiresContext();
		const bot = this.message.guild.me.client;
		const ttl = 72 * 3600 * 1000;
		await bot.kdb.set(this.message.channel.id, this.toRaw(), 'combat', ttl);
	}

	/**
	 * Returns the generated summary message content.
	 * @param {boolean} hidden Wether it's private or not
	 * @returns {string}
	 */
	getSummary(hidden = false) {
		let outStr = '```markdown\n'
			+ `${this.options.name ? this.options.name : 'Current initiative'}: `
			+ `${this.turn} (round ${this.round})\n`;
		outStr += '='.repeat(outStr.length - 13) + '\n';

		let combatantStr = '';
		for (const slot of this.initiatives.slots) {
			const ref = this.initiatives.get(slot);
			const c = this.combatants.find(cb => cb.id === ref);
			const init = Math.floor(slot);
			combatantStr += (slot === this.index ? '# ' : '  ')
				+ c.getSummary(init, hidden) + '\n';
		}
		if (outStr.length + combatantStr.length + 3 > 2000) {
			combatantStr = '';
			for (const slot of this.initiatives.slots) {
				const ref = this.initiatives.get(slot);
				const c = this.combatants.find(cb => cb.id === ref);
				const init = Math.floor(slot);
				combatantStr += (slot === this.index ? '# ' : '  ')
					+ c.getSummary(init, hidden, true) + '\n';
			}
		}
		outStr += combatantStr + '```';
		return outStr;
	}

	/**
	 * Edits the summary message with the latest summary.
	 * @async
	 */
	async updateSummary() {
		await (await this.getSummaryMsg()).edit(this.getSummary());
	}

	/**
	 * Gets the Channel object of the combat.
	 * @returns {Discord.Channel}
	 */
	getChannel() {
		if (this.message) {
			return this.message.channel;
		}
		else {
			//const chan = this.message.guild.me.channels.cache.get(this.message);
			throw new CombatChannelNotFound();
		}
	}

	/**
	 * Gets the Message object of the combat summary.
	 * @async
	 */
	async getSummaryMsg() {
		// Checks if cached and returns it.
		// -todo-
		// Otherwise fetches it.
		const msg = await this.getChannel().messages.cache.get(this.summary);
		// Caches it.
		// -todo-
		// Returns it.
		return msg;
	}

	/**
	 * Final commit/update.
	 * @async
	 */
	async final() {
		await this.commit();
		await this.updateSummary();
	}

	/**
	 * Ends combat in a channel.
	 * @async
	 */
	async end() {
		for (const c of this.combatants) {
			c.onRemove();
		}
		const bot = this.message.guild.me.client;
		const id = this.message.channel.id;
		bot.combats.delete(id);
		await bot.kdb.delete(id, 'combat');
	}

	toString() {
		return `Initiative in <#${this.channel}>`;
	}
}

class YZCombatant {

	constructor(data) {
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
		this.controller = data.controller;
		if(!data.controller) throw new Error('YZCombattant has no controller');

		this._name = data.name || `Unnamed Character "${Util.randomID(4)}"`;
		this.hp = +data.hp || 3;
		this.armor = +data.armor || 0;
		this.speed = +data.speed || 1;
		this.hidden = data.hidden ? true : false;
		// this.stats = data.stats || {};
		// this.skills = data.skills || {};
		// this.status = YZCombatant.STATUS_LIST[0];
		this.notes = data.notes || '';

		// Integers[]
		this.inits = data.inits || [];

		/**
		 * Combat write only; Position in combat
		 * @type {number}
		 *
		this.index = data.index || 0;//*/
		this.group = data.group;
	}

	get name() { return this._name; }
	set name(newName) { this._name = newName; }

	get maxhp() { return this._maxhp; }
	set maxhp(newMaxHp) {
		this._maxhp = newMaxHp;
		if (!this.hp) this.hp = newMaxHp;
	}

	static fromRaw(raw, message, combat) {
		return new YZCombatant(raw);
	}

	static toRaw() {
		return {
			controller: this.controller,
			inits: this.inits,
			hidden: this.hidden,
			notes: this.notes,
			group: this.group,
			type: 'common',
		};
	}

	/**
	 * Returns a string representation of the combatant's HP.
	 * @param {?boolean} [hidden=false] Whether to return the full revealed stats or not
	 * @returns {string}
	 */
	hpString(hidden = false) {
		let hpStr = '';
		if (!(this.isPrivate() || hidden)) {
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
	 * @param {?boolean} [hidden=false] Whether to return the full revealed stats or not
	 * @param {?boolean} [hideNotes=false] Wether to Hide notes or not
	 * @returns {string} A string describing the combatant
	 */
	getSummary(init, hidden = false, hideNotes = false) {
		const hpStr = this.hpString(hidden);
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
	 * @param {boolean} [hidden=false] Whether to return the full revealed stats or not
	 * @returns {string} A string describing the combatant
	 */
	getStatus(hidden = false) {
		const name = this.name;
		const hpar = this.getHpAndAr(hidden);
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

	getHpAndAr(hidden = false) {
		const out = [this.hpString(hidden)];
		if (this.armor && !(this.isPrivate() || hidden)) {
			out.push(`AR ${this.armor}`);
		}
		return out.join(' ');
	}

	isPrivate() {
		return this.hidden;
	}

	controllerMention() {
		return `<@${this.controller}>`;
	}

	/**
	 * Called when the combatant is removed from combat, either through !i remove or the combat ending.
	 */
	onRemove() { return; }

	/**
	 * A method called at the start of each of the combatant's turns.
	 * @param {?number} [numTurns=1] The number of turns that just passed
	 */
	onTurnUpkeep(numTurns = 1) { return; }

	/**
	 * A method called at the end of each of the combatant's turns.
	 * @param {?number} [numTurns=1] The number of turns that just passed
	 */
	onTurnEnd(numTurns = 1) { return; }

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

	constructor(name, inits, combatants) {
		super({ inits });
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

	static fromRaw(raw, message, combat) {
		const combatants = [];
		for (const c of raw.combatants) {
			if (c.type === 'common') {
				combatants.push(YZCombatant.fromRaw(c, message, combat));
			}
			else {
				throw new CombatException('Unknown Combatant Type');
			}
		}
		return 
	}
	static toRaw() {
		return {
			name: this.name,
			inits: this.inits,
			combatants: this.getCombatants().map(c => c.toRaw()),
			index: this.index,
			type: 'group',
		};
	}

	addCombatant(combatant) {
		combatant.group = this.name;
		combatant.inits = this.inits;
		this.combatants.push(combatant);
	}

	removeCombatant(combatant) {
		this.combatants = this.combatants.filter(c => c !== combatant);
	}

	getSummary(init, hidden = false, hideNotes = false) {
		let status = '';
		const clen = this.combatants.length;
		if (clen > 7 && !hidden) {
			status = `${Util.zeroise(init, 2)}: ${this.name} (${clen} combatant${clen > 1 ? 's' : ''})`;
		}
		else {
			status = `${Util.zeroise(init, 2)}: ${this.name}`;
			for (const c of this.combatants) {
				const summary = c.getSummary(init, hidden, hideNotes).split(': ');
				summary.shift();
				status += `\n     - ${summary.join(': ')}`;
			}
		}
		return status;
	}

	getStatus(hidden = false) {
		const statusList = this.combatants.map(c => c.getStatus(hidden));
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

class NoCombatants extends Error {
	constructor(msg) {
		super(msg);
		this.name = 'NoCombatants';
	}
}

class ChannelInCombat extends Error {
	constructor(msg) {
		super(msg);
		this.name = 'ChannelInCombat';
	}
}

class RequiresContext extends Error {
	constructor(msg) {
		super(msg);
		this.name = 'RequiresContext';
	}
}

class CombatNotFound extends Error {
	constructor(msg) {
		super(msg);
		this.name = 'CombatNotFound';
	}
}

class CombatChannelNotFound extends Error {
	constructor(msg) {
		super(msg);
		this.name = 'CombatChannelNotFound';
	}
}

class CombatException extends Error {
	constructor(msg) {
		super(msg);
		this.name = 'CombatException';
	}
}