const Character = require('./Character');
const Conditions = require('../Conditions');

class SurvivalCharacter extends Character {
	constructor(owner, data) {
		super(owner, data);

		/**
		 * Conditions of the character.
		 * @type {Conditions} (Discord.Bitfield)
		 */
		this.conditions = new Conditions(data.conditions);
		if (data.starving || data.hungry) this.conditions.add(Conditions.FLAGS.STARVING);
		if (data.dehydrated || data.thirsty) this.conditions.add(Conditions.FLAGS.DEHYDRATED);
		if (data.sleepless || data.sleepy) this.conditions.add(Conditions.FLAGS.SLEEPLESS);
		if (data.hypothermic || data.cold) this.conditions.add(Conditions.FLAGS.HYPOTHERMIC);
	}

	set damage(n) {
		const str = this.attributes.find(a => a.primitive === 'str');
		if (str) str.trauma = n;
	}

	get damage() {
		const str = this.attributes.find(a => a.primitive === 'str');
		if (str) return str.trauma;
		return NaN;
	}

	set fatigue(n) {
		const agi = this.attributes.find(a => a.primitive === 'agi');
		if (agi) agi.trauma = n;
	}

	get fatigue() {
		const agi = this.attributes.find(a => a.primitive === 'agi');
		if (agi) return agi.trauma;
		return NaN;
	}

	set confusion(n) {
		const int = this.attributes.find(a => a.primitive === 'int');
		if (int) int.trauma = n;
	}

	get confusion() {
		const int = this.attributes.find(a => a.primitive === 'int');
		if (int) return int.trauma;
		return NaN;
	}

	set doubt(n) {
		const emp = this.attributes.find(a => a.primitive === 'emp');
		if (emp) emp.trauma = n;
	}

	get doubt() {
		const emp = this.attributes.find(a => a.primitive === 'emp');
		if (emp) return emp.trauma;
		return NaN;
	}

	toRaw() {
		return Object.assign(super.toRaw(), {
			conditions: this.conditions.bitfield,
		});
	}
}

module.exports = SurvivalCharacter;