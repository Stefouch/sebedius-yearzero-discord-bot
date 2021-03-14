const { YZEmbed } = require('../utils/embeds');
const { __ } = require('../lang/locales');

module.exports = {
	name: 'prefix',
	category: 'misc',
	description: 'cprefix-description',
	guildOnly: false,
	args: false,
	usage: '[set <new prefix>] [-lang language_code]',
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

		if (argv._.length > 0) {
			if (argv._[0].toLowerCase() === 'set' && argv._.length === 2) {
				return await ctx.bot.commands.get('setconf').run(['prefix', argv._[1]], ctx);
			}
			else {
				return await ctx.reply(
					`:information_source: ${__('cprefix-invalid-arguments', lang)}. `
					+ `${__('cprefix-proper-usage', lang)} \`${ctx.prefix}prefix ${module.exports.usage}\`.`,
				);
			}
		}
		const msg = `1. ${ctx.bot.mention}\n2. ${ctx.prefix}`;
		const embed = new YZEmbed(__('cprefix-embed-title', lang), msg).setFooter(__('cprefix-embed-footer', lang));
		return await ctx.send(embed);
	},
};