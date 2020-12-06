const { BitField } = require('discord.js');

class Ranges extends BitField {}

Ranges.FLAGS = {
	CLOSE: 1 << 1,
	SHORT: 1 << 2,
	MEDIUM: 1 << 3,
	LONG: 1 << 4,
	EXTREME: 1 << 5,
};

module.exports = Ranges;