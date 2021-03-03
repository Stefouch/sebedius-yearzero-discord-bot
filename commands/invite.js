const { YZEmbed } = require('../utils/embeds');
const { __ } = require('../utils/locales');

module.exports = {
	name: 'invite',
	aliases: ['inv'],
	category: 'misc',
	description: 'cinvite-description',
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
			'🎲 ' + __('cinvite-title', lang),
			__('cinvite-text', lang) + `: ${ctx.bot.inviteURL}`,
			ctx,
		);
		return ctx.send(embed);
	},
};