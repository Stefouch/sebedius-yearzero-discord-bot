const SurvivalCharacter = require('./SurvivalCharacter');

class ForbiddenLandsCharacter extends SurvivalCharacter {
	constructor(owner, data) {
		super(owner, data);
		this.game = 'fbl';

		/**
		 * The profession (role) of the character.
		 */
		this.profession = data.profession;
	}

	toRaw() {
		return Object.assign(super.toRaw(), {
			profession: this.profession,
		});
	}
}

module.exports = ForbiddenLandsCharacter;