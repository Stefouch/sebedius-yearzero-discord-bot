const { checkPermissions } = require('../Sebedius');
const { __ } = require('../lang/locales');

module.exports = {
	name: 'ping',
	category: 'misc',
	description: 'cping-description',
	cooldown: 10,
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

		// Aborts if the bot doesn't have the needed permissions.
		if (!await checkPermissions(ctx, null, lang)) return;

		const msg = await ctx.send(__('cping-pinging', lang));
		return await msg.edit(`${__('cping-result', lang)} ${msg.createdTimestamp - ctx.createdTimestamp}ms.`);
	},
};