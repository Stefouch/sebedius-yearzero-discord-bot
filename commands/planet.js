//const Artos = require('../data/artifacts.list.json');
const YZEmbed = require('../util/YZEmbed');
const Star = require('../util/ALIENStarGenerator');
const { random } = require('../util/Util');

module.exports = {
	name: 'planet',
	description: 'Generates a random Planet for the ALIEN rpg.'
		+ '',
	aliases: ['star'],
	guildOnly: false,
	args: false,
	usage: '',
	async execute(args, message, client) {
		const star = new Star();
	},
};