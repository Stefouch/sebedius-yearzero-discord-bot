const { getTable } = require('../Sebedius');
const { rollD66 } = require('../utils/Util');
const { YZEmbed } = require('../utils/embeds');
const { __ } = require('../lang/locales');

module.exports = {
	name: 'mishap',
	category: 'fbl',
	description: 'cmishap-description',
	guildOnly: false,
	args: false,
	usage: '[reference]',
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

		if (argv._[0] && !/[123456]{2}/.test(argv._[0])) {
			return await ctx.reply(`⚠️ ${__('cmishap-invalid-reference', lang)}!`);
		}
		const mishapTable = getTable('MAGIC_MISHAP', './gamedata/fbl/', 'fbl-magic-mishaps', lang, 'csv');
		const ref = +argv._[0] || rollD66();
		const mishap = mishapTable.get(ref);

		const embed = new YZEmbed(
			`${__('magic-mishap', lang)} (${ref})`,
			mishap.effect.replace('{prefix}', ctx.prefix),
			ctx,
			true,
		);
		return await ctx.send(embed);
	},
};