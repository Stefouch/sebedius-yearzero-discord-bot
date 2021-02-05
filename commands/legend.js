const { YZEmbed } = require('../utils/embeds');
const Legend = require('../generators/FBLLegendGenerator');
const { getValidLanguageCode } = require('../utils/Util');

module.exports = {
	name: 'legend',
	aliases: ['generate-legend'],
	category: 'fbl',
	description: 'Generates a random legend according to the tables found in'
		+ 'the *Forbidden Lands - Gamemaster\'s Guide*.',
	guildOnly: false,
	args: false,
	usage: '[-lang language_code]',
	async run(args, ctx) {
		const argv = require('yargs-parser')(args, {
			string: ['lang'],
			alias: {
				lang: ['lng', 'language']
			},
			default: {
				lang: null
			},
			configuration: ctx.bot.config.yargs,
		});
		const lang = await getValidLanguageCode(argv.lang, ctx);

		const legend = new Legend(lang);
		const embed = new YZEmbed('Legend', legend.story);
		return await ctx.send(embed);
	},
};