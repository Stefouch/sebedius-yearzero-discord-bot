const { YZEmbed } = require('../utils/embeds');
const Legend = require('../generators/FBLLegendGenerator');

module.exports = {
	name: 'legend',
	aliases: ['generate-legend'],
	category: 'fbl',
	description: 'Generates a random legend according to the tables found in'
		+ 'the *Forbidden Lands - Gamemaster\'s Guide*.',
	guildOnly: false,
	args: false,
	usage: '',
	async run(args, ctx) {
		const legend = new Legend();
		const embed = new YZEmbed('Legend', legend.story);
		return await ctx.send(embed);
	},
};