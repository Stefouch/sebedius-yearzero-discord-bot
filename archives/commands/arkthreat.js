const { YZEmbed } = require('../utils/embeds');
const { random } = require('../utils/Util');
const { __ } = require('../lang/locales');

module.exports = {
	name: 'arkthreat',
	aliases: ['akth'],
	category: 'myz',
	description: 'carkthreat-description',
	guildOnly: false,
	args: false,
	usage: '[-lang <language_code>]',
	async run(args, ctx) {
		// Parses the arguments.
		const argv = require('yargs-parser')(args, {
			string: ['lang'],
			alias: {
				lang: ['lng', 'language'],
			},
			default: {
				lang: null,
			},
			configuration: ctx.bot.config.yargs,
		});
		const lang = await ctx.bot.getValidLanguageCode(argv.lang, ctx);
		const ArkThreats = require(`../gamedata/myz/ark-threats.list.${lang}.json`);
		const embed = new YZEmbed(__('carkthreat-title', lang), random(ArkThreats));
		return await ctx.send(embed);
	},
};