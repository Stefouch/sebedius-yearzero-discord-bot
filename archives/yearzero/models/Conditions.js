const { BitField } = require('discord.js');

/**
 * Data structure that makes it easy to interact with a Conditions flags bitfield.
 * @extends {BitField}
 */
class Conditions extends BitField {}

Conditions.FLAGS = {
	STARVING: 1 << 1,
	DEHYDRATED: 1 << 2,
	SLEEPLESS: 1 << 3,
	HYPOTHERMIC: 1 << 4,
};

module.exports = Conditions;