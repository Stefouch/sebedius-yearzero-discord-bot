const ArkThreats = require('../gamedata/myz/ark-threats.list.json');
const { YZEmbed } = require('../utils/embeds');
const { random } = require('../utils/Util');

module.exports = {
	name: 'arkthreat',
	aliases: ['akth'],
	category: 'myz',
	description: 'Draws a random threat against the Ark.',
	guildOnly: false,
	args: false,
	usage: '',
	async run(args, ctx) {
		const embed = new YZEmbed('Threat Against the Ark', random(ArkThreats));
		return ctx.channel.send(embed);
	},
};