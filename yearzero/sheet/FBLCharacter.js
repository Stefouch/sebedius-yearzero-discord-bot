const Character = require('./Character');

class ForbiddenLandsCharacter extends Character {
	constructor(owner, data) {
		super(owner, data);
		this.game = 'fbl';
	}
}

module.exports = ForbiddenLandsCharacter;