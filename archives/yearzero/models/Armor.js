const BaseGear = require('./BaseGear');

class Armor extends BaseGear {
	constructor(data) {
		super(data);

		/**
		 * The Armor Rating of this piece of armor.
		 * @type {number}
		 */
		this.rating = data.rating;
	}

	toRaw() {
		return Object.assign(super.toRaw(), {
			rating: this.rating,
		});
	}
}

module.exports = Armor;