const ArkThreats = require('../data/ark-threats.list.json');
const YZEmbed = require('../util/YZEmbed');
const { random } = require('../util/Util');

module.exports = {
	name: 'arkthreat',
	type: 'Mutant: Year Zero',
	description: 'Draws a random threat against the Ark.',
	aliases: ['akth'],
	guildOnly: false,
	args: false,
	usage: '',
	async execute(args, message, client) {
		const embed = new YZEmbed('Threat Against the Ark', random(ArkThreats));
		return message.channel.send(embed);
	},
};