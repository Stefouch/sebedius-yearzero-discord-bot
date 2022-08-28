const { YZEmbed } = require('../utils/embeds');
const Legend = require('../generators/FBLLegendGenerator');
const { __ } = require('../lang/locales');

module.exports = {
	name: 'legend',
	aliases: ['generate-legend'],
	category: 'fbl',
	description: 'clegend-description',
	guildOnly: false,
	args: false,
	usage: '[-lang <language_code>]',
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
		const lang = await ctx.bot.getValidLanguageCode(argv.lang, ctx);

		const legend = new Legend(lang);
		const embed = new YZEmbed(__('legend', lang), legend.story);
		return await ctx.send(embed);
	},
};