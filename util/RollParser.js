const Util = require('./Util');

const ROLLREGEX = /(\d*)(?:[dD])(\d+)([+-]\d+)?/gi;

class Roll {
	constructor() {
		throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
	}

	static parse(rollString) {
		const roll = {};
		rollString.replace(ROLLREGEX, (match, p1, p2, p3, offset, string) => {
			// COUNT
			roll.count = +p1 || 1;
			// TYPE
			roll.type = +p2 || 6;
			// MODIFIER
			roll.modifier = +p3 || 0;
		});
		return roll;
	}

	static roll(rollObj) {
		
	}
}

module.exports = Roll;