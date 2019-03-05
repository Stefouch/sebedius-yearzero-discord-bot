const GeneratorData = require('./data/monster-generator.json');
const YZEmbed = require('../util/YZEmbed');
const Util = require('../util/Util');

module.exports = {
	name: 'monster',
	description: 'Generates a random monster according to the tables found in'
		+ '*Zone Compendium 1: The Lair of the Saurians*',
	aliases: ['generate-monster'],
	guildOnly: false,
	args: false,
	// usage: '[]',
	execute(args, message) {
		// Monster object.
		const monster = {};

		for (const param in GeneratorData) {
			// Gets the roll for the parameter.
			const roll = Util.parseRoll(GeneratorData[param].roll);

			// Finds the 
			const data = GeneratorData[param].data;
			for (let i = roll; i > 0; i--) {
				if (`${i}` in threats && rnd >= i) {
					threat = threats[`${i}`];
					break;
				}
			}
		}
	},
};