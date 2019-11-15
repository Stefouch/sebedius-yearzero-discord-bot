//const Artos = require('../data/artifacts.list.json');
const YZEmbed = require('../util/YZEmbed');
const { random } = require('../util/Util');

module.exports = {
	name: 'planet',
	description: 'Draws a random artifact from the MYZ core rulebook. Available sources are:'
		+ '',
	aliases: ['arto'],
	guildOnly: false,
	args: false,
	usage: '',
	async execute(args, message, client) {
	},
};