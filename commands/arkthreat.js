const ArkThreats = require('../gamedata/ark-threats.list.json');
const YZEmbed = require('../utils/YZEmbed');
const { random } = require('../utils/Util');

module.exports = {
	name: 'arkthreat',
	group: 'Mutant: Year Zero',
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