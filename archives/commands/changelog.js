const { YZEmbed } = require('../utils/embeds');
const { __ } = require('../lang/locales');

module.exports = {
	name: 'changelog',
	category: 'misc',
	description: 'cchangelog-description',
	guildOnly: false,
	args: false,
	usage: '',
	async run(args, ctx) {
		// Parses arguments.
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

		const embed = new YZEmbed(
			`📑 Sebedius ${__('changelog', lang)}`,
			`${__('cchangelog-text', lang)} `
			+ 'https://github.com/Stefouch/sebedius-yearzero-discord-bot/blob/master/CHANGELOG.md',
			ctx,
		);
		return ctx.send(embed);
	},
};