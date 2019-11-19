//const Artos = require('../data/artifacts.list.json');
const YZEmbed = require('../util/YZEmbed');
const Star = require('../util/ALIENStarGenerator');
const World = require('../util/ALIENWorldGenerator');
const { random } = require('../util/Util');

module.exports = {
	name: 'star',
	description: 'Generates a Star sector for the ALIEN rpg.'
		+ '',
	aliases: ['★'],
	guildOnly: false,
	args: false,
	usage: '',
	async execute(args, message, client) {
		const star = new Star();
	},
};