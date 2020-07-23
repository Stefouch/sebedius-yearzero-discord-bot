const { YZEmbed } = require('../utils/embeds');
const Legend = require('../generators/FBLLegendGenerator');

module.exports = {
	name: 'legend',
	group: 'Forbidden Lands',
	description: 'Generates a random legend according to the tables found in'
		+ 'the *Forbidden Lands - Gamemaster\'s Guide*.',
	aliases: ['generate-legend'],
	guildOnly: false,
	args: false,
	usage: '',
	async execute(args, ctx) {
		const legend = new Legend();

		const embed = new YZEmbed('Legend', legend.story);

		return ctx.channel.send(embed);
	},
};