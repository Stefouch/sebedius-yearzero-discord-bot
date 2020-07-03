const YZRoll = require('./YZRoll');
const Util = require('../utils/Util');
const YZInitiative = require('./YZInitiative');
const Sebedius = require('../Sebedius');
const { SUPPORTED_GAMES } = require('../utils/constants');

class YZCombat {

	constructor(channelId, summaryMessageId, dmId,
		options, ctx, combatants, initiatives = null,
		roundNum = 0, currentIndex = null,
		game = null,
	) {
		/**
		 * The Discord TextChannel ID of the channel were the combat instance is ongoing.
		 * @type {string} Snowflake
		 */
		this.channel = channelId;

		/**
		 * The Discord Message ID of the summary message.
		 * @type {string} Snowflake
		 */
		this.summary = summaryMessageId;

		/**
		 * The GM's Discord User ID.
		 * @type {string} Snowflake
		 */
		this.dm = dmId;

		/**
		 * Options.
		 */
		this.options = options || {};

		/**
		 * The current round.
		 * @type {number}
		 */
		this.round = +roundNum || 0;

		/**
		 * The current initiative index (float value).
		 * @type {number} float
		 */
		this.index = +currentIndex || 0;

		/**
		 * The Discord Message.
		 * @type {Discord.Message}
		 */
		this.message = ctx;

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
		this.initiatives = initiatives ? new YZInitiative(initiatives) : new YZInitiative();

		/**
		 * The game set for this combat instance.
		 * @type {string}
		 */
		this.game = game;
	}

	/**
	 * The current turn number.
	 * @type {number}
	 * @see YZCombat#index
	 * @readonly
	 */
	get turn() {
		return Math.floor(this.index);
	}

	/**
	 * The game set for this combat instance.
	 * @type {string}
	 */
	get game() { return this._game; }
	set game(newGame) {
		if (SUPPORTED_GAMES.includes(newGame)) {
			this._game = newGame;
		}
		else {
			this._game = null;
		}
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
	}

	static async fromId(channelId, ctx) {
		if (ctx.bot.combats.has(channelId)) {
			return ctx.bot.combats.get(channelId);
		}
		else {
			const raw = await ctx.bot.kdb.combats.get(channelId);
			if (!raw) {
				throw new CombatNotFound(channelId);
			}
			const instance = YZCombat.fromRaw(raw, ctx);
			return instance;
		}
	}

	static fromRaw(raw, ctx) {
		const instance = new YZCombat(
			raw.channel,
			raw.summary,
			raw.dm,
			raw.options,
			ctx,
			null,
			raw.initiatives,
			raw.round,
			raw.index,
			raw.game,
		);
		for (const cRaw of raw.combatants) {
			if (cRaw.type === 'common') {
				instance.combatants.push(YZCombatant.fromRaw(cRaw));
			}
			else if (cRaw.type === 'group') {
				instance.combatants.push(YZCombatantGroup.fromRaw(cRaw));
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
			initiatives: [...this.initiatives],
			round: this.round,
			index: this.index,
			game: this.game,
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
			if (!combatant) return true;
			return !combatant.inits.includes(Math.floor(slot));
		});

		// Adds missing initiative slots.
		this.combatants.forEach(c => {
			const draw = c.speed - c.inits.length;
			if (draw > 0) {
				const drawnInits = this.initiatives.drawInit(draw, c.haste);
				c.inits.push(...drawnInits);
			}
			c.inits.forEach(init => {
				const hasInit = this.initiatives.some(
					(ref, slot) => c.id === ref && init === Math.floor(slot),
				);
				if (!hasInit) {
					this.initiatives.addInitiative(c.id, +init);
				}
			});
			if (c instanceof YZCombatantGroup) {
				c.combatants.forEach(g => g.inits = c.inits);
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
	 * Applies damage to a combatant and performs an Armor roll.
	 * @param {YZCombatant} combatant The target to damage
	 * @param {number} damage The quantity of damage
	 * @param {?boolean} [degradeArmor=false] Wether the armor should be degraded by rolled banes
	 * @param {?number} [armorMod=0] Armor modifier (after factor)
	 * @param {?number} [armorFactor=1] Armor multiplicator (use 0.5 for armor piercing)
	 * @returns {YZRoll} The armor roll
	 */
	damageCombatant(combatant, damage, degradeArmor = false, armorMod = 0, armorFactor = 1) {
		const bot = this.message.guild.me.client;
		const controller = bot.users.cache.get(combatant.controller);

		// Calculates the armor value.
		const armor = Math.ceil(combatant.armor * armorFactor) + armorMod;

		// Rolls the dice.
		const armorRoll = new YZRoll(
			controller,
			{ gear: armor },
			`${combatant.name}: Armor Roll`,
		);
		// Damaging the combatant.
		damage -= armorRoll.sixes;
		if (damage > 0) combatant.hp = Math.max(combatant.hp - damage, 0);
		// Damaging the armor.
		if (damage > 0 && degradeArmor) {
			combatant.armor -= armorRoll.banes;
		}
		return armorRoll;
	}

	/**
	 * Gets a combatant group.
	 * @param {string} name The name of the combatant group
	 * @param {?number[]} inits The initiative to create a group at if a group is not found
	 * @param {?number} [speed=1] The speed of the group
	 * @param {?number} [haste=1] The haste of the group
	 * @param {?boolean} [strict=true] Wether the group name must be a full case insensitive match
	 * @returns {YZCombatantGroup}
	 */
	getGroup(name, strict = true, inits = null, speed = 1, haste = 1) {
		let grp;
		if (strict) {
			const nameLc = name.toLowerCase();
			grp = this.getGroups().find(g => g.name.toLowerCase() == nameLc);
		}
		else {
			const nameLc = name.toLowerCase();
			grp = this.getGroups().find(g => g.name.toLowerCase().includes(nameLc));
		}

		// Initiative "0" does not exist so it's good to test it like this.
		if (!grp && inits) {
			grp = new YZCombatantGroup(
				name,
				null,
				{
					controller: this.message.author.id,
					speed, haste, inits,
				},
			);
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
	 * @param {?Discord.Message} choiceMessage Additional text to pass in the selector
	 * @param {?boolean} [selectGroup=false] Whether to allow groups to be selected
	 * @returns {YZCombatant} The selected Combatant, or None if the search failed
	 * @async
	 */
	async selectCombatant(name, choiceMessage = null, selectGroup = false) {
		name = name.toLowerCase();
		let matching = this.getCombatants(selectGroup).filter(c => c.name.toLowerCase() == name);
		if (matching.length === 0) {
			matching = this.getCombatants(selectGroup).filter(c => c.name.toLowerCase().includes(name));
		}
		if (!selectGroup) {
			matching = matching.map(c => [c.name, c]);
		}
		else {
			matching = matching.map(c => {
				if (c instanceof YZCombatantGroup) return [`__${c.name}__ (group)`, c];
				return [c.name, c];
			});
		}
		return await Sebedius.getSelection(this.message, matching, choiceMessage);
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
		return [changedRound, []];
	}

	rewindTurn() {
		if (this.combatants.length === 0) throw new NoCombatants();
		if (this.currentCombatant) this.currentCombatant.onTurnEnd();

		const previousInit = this.initiatives.previous(this.index);

		// Start of combat.
		if (this.index == null || this.index == undefined) {
			this.index = this.initiatives.max;
		}
		// Previous round.
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
		const messages = [];
		this.round += numRounds;
		for (const combatant of this.combatants) {
			combatant.onTurnUpkeep(numRounds);
			combatant.onTurnEnd(numRounds);
		}
		if (this.options.dynamic) {
			messages.push('New initiatives!');
		}
		return messages;
	}

	getTurnString() {
		const nextCombatant = this.currentCombatant;
		let outStr = '';

		if (nextCombatant instanceof YZCombatantGroup) {
			const thisTurn = nextCombatant.getCombatants();
			outStr = `:arrow_forward: **Initiative ${this.turn} (round ${this.round})**: `
				+ `(${nextCombatant.name})\n`
				+ thisTurn.map(c => c.controllerMention()).join(', ')
				+ '```markdown\n'
				+ thisTurn.map(c => c.getStatus()).join('\n')
				+ '```';
		}
		else {
			outStr = `:arrow_forward: **Initiative ${this.turn} (round ${this.round}):** `
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

	static async ensureUniqueChan(ctx) {
		const data = await ctx.bot.kdb.combats.get(ctx.channel.id);
		if (data) throw new ChannelInCombat();
	}

	/**
	 * Commits the combat to database.
	 * @async
	 */
	async commit() {
		if (!this.message) throw new RequiresContext();
		const bot = this.message.guild.me.client;
		bot.combats.set(this.message.channel.id, this);

		// Saves to database for 1 week.
		const ttl = 7 * 24 * 3600 * 1000;
		const raw = this.toRaw();
		await bot.kdb.combats.set(this.message.channel.id, raw, ttl);
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
			//const chans = this.
			//const chan = bot.channels.cache.get(this.channel);
			//if (chan) return chan;
			//else throw new CombatChannelNotFound();
			throw new CombatChannelNotFound();
		}
	}

	/**
	 * Gets the Message object of the combat summary.
	 * @async
	 */
	async getSummaryMsg() {
		const messages = this.getChannel().messages;
		if (messages.cache.has(this.summary)) return messages.cache.get(this.summary);
		return await messages.fetch(this.summary);
	}

	/**
	 * Final commit/update.
	 * @async
	 */
	async final() {
		await this.commit();
		await this.updateSummary();
		console.log(this);
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
		await bot.kdb.combats.delete(id);
	}

	toString() {
		return `Initiative in <#${this.channel}>`;
	}
}

class YZCombatant {

	constructor(data) {
		/**
		 * The unique ID of this combatant.
		 * @name YZCombatant#id
		 * @type {string}
		 * @-readonly
		 */
		this.id = data.id || Util.randomID();
		/* Object.defineProperty(this, 'id', {
			value: data.id || Util.randomID(),
			enumerable: true,
		});//*/

		if(!data.controller) throw new Error('YZCombattant has no controller');
		/**
		 * The controller's Discord User ID of this combatant.
		 * @type {string} Snowflake
		 */
		this.controller = data.controller;

		/**
		 * Cached name, because how it's used in YZCombatantGroup.
		 */
		this._name = data.name || 'Unnamed';

		// this.hp = +data.hp || 3;
		this.maxhp = +data.hp || 3;
		this.armor = +data.armor || 0;
		this.speed = +data.speed || 1;
		this.haste = +data.haste || 1;

		/**
		 * Should this combatant be hidden?
		 * @type {boolean}
		 * @default false
		 */
		this.hidden = data.hidden ? true : false;

		/**
		 * Notes.
		 * @type {string}
		 */
		this.notes = data.notes || '';

		/**
		 * Initiative values. Stored as integers.
		 * @type {number[]}
		 */
		this.inits = data.inits || [];

		/**
		 * The name of the group this combatant is part of.
		 * @type {string}
		 */
		this.group = data.group || null;
	}

	/**
	 * The combatant's name.
	 * @type {string}
	 */
	get name() { return this._name; }
	set name(newName) { this._name = newName; }

	/**
	 * The health of this combatant.
	 * @type {number} >0
	 */
	get hp() { return this._hp; }
	set hp(newHp) {
		this._hp = Util.clamp(newHp, 0, 100);
	}

	/**
	 * The combatant's maximum health.
	 * @type {number}
	 */
	get maxhp() { return this._maxhp; }
	set maxhp(newMaxHp) {
		this._maxhp = Util.clamp(newMaxHp, 0, 100);
		if (!this.hp) this.hp = newMaxHp;
	}

	/**
	 * The Armor Rating.
	 * @type {number} >=0
	 */
	get armor() { return this._armor; }
	set armor(newArmor) {
		this._armor = Util.clamp(newArmor, 0, 30);
	}

	/**
	 * The speed (number of initiative card drawn).
	 * @type {number} >0
	 */
	get speed() { return this._speed; }
	set speed(newSpeed) {
		this._speed = Util.clamp(newSpeed, 1, 10);
	}

	/**
	 * The quantity of initiative cards drawn for 1 that is kept.
	 * Lightning Fast.
	 * @type {number} >0
	 */
	get haste() { return this._haste; }
	set haste(newHaste) {
		this._haste = Util.clamp(newHaste, 1, 10);
	}

	/**
	 * Initiative values. Stored as integers.
	 * @type {number[]}
	 */
	get inits() { return this._inits; }
	set inits(newInits) {
		this._inits = newInits.map(init => Util.clamp(init, 1, 99));
	}

	static fromRaw(raw) {
		return new YZCombatant(raw);
	}

	toRaw() {
		return {
			name: this.name,
			controller: this.controller,
			id: this.id,
			hp: this.hp,
			maxhp: this.maxhp,
			armor: this.armor,
			speed: this.speed,
			haste: this.haste,
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
	 * @param {?boolean} [hidden=false] Whether to return the full revealed stats or not
	 * @returns {string} A string describing the combatant
	 */
	getStatus(hidden = false) {
		const name = this.name;
		const hpar = this.getHpAndAr(hidden);

		let vitesse = '';
		if (this.speed > 0 || this.haste > 1) {
			vitesse += ` Speed ${this.speed}`;
			if (this.haste > 1) vitesse += `, Haste ${this.haste}`;
		}

		const notes = this.notes ? `\n# ${this.notes}` : '';

		return `${name} ${hpar}${this.armor ? ',' : ''}${vitesse} ${notes}`.trim();
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
}

class YZCombatantGroup extends YZCombatant {

	constructor(name, combatants, data) {
		super(data);
		this._name = name || Util.randomID(4);

		/**
		 * The list of combatants in this group.
		 * @type {YZCombatant[]}
		 */
		this.combatants = combatants || [];
	}

	/**
	 * The name of this group.
	 * @type {string}
	 */
	get name() { return this._name; }
	set name(newName) {
		this._name = newName;
		this.combatants.forEach(c => c.group = this.name);
	}

	static fromRaw(raw) {
		const combatants = [];
		for (const cRaw of raw.combatants) {
			if (cRaw.type === 'common') {
				combatants.push(YZCombatant.fromRaw(cRaw));
			}
			else {
				throw new CombatException('Unknown Combatant Type');
			}
		}
		return new YZCombatantGroup(
			raw.name,
			combatants,
			{
				id: raw.id,
				controller: raw.controller,
				speed: raw.speed,
				haste: raw.haste,
				inits: raw.inits,
			},
		);
	}

	toRaw() {
		const raw = super.toRaw();
		raw.combatants = this.getCombatants().map(c => c.toRaw());
		raw.type = 'group';
		return raw;
	}

	getCombatants() {
		return this.combatants;
	}

	addCombatant(combatant) {
		combatant.group = this.name;
		combatant.inits = this.inits;
		combatant.speed = this.speed;
		combatant.haste = this.haste;
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

module.exports = {
	YZCombat, YZCombatant, YZCombatantGroup,
	NoCombatants, ChannelInCombat, RequiresContext, CombatNotFound, CombatChannelNotFound, CombatException,
};
