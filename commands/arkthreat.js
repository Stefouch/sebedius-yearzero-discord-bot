const ArkThreats = require('../sheets/ark-threats.list.json');
const YZEmbed = require('../utils/YZEmbed.js');
const { rand } = require('../utils/utils.js');

module.exports = {
	name: 'arkthreat',
	description: 'Draws a random threat against the Ark.',
	aliases: ['akth'],
	guildOnly: false,
	args: false,
	// usage: '',
	execute(args, message) {
		const nb = rand(1, ArkThreats.length) - 1;
		const embed = new YZEmbed('Threat Against the Ark', ArkThreats[nb]);
		message.channel.send(embed);
	},
};