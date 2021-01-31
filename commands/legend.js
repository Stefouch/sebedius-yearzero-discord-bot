const { YZEmbed } = require('../utils/embeds');
const Legend = require('../generators/FBLLegendGenerator');
const { SUPPORTED_LANGS } = require('../utils/constants');

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
		const lang = Object.keys(SUPPORTED_LANGS).includes(argv.lang) ? argv.lang 
					: await ctx.bot.kdb.langs.get(ctx.guild.id) 
					?? 'en';

		const legend = new Legend(lang);
		const embed = new YZEmbed('Legend', legend.story);
		return await ctx.send(embed);
	},
};