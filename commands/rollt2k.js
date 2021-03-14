module.exports = {
	name: 'rollt2k',
	aliases: ['rolltwilight', 'rollw', 'rw'],
	category: 't2k',
	description: 'crollt2k-description',
	moreDescriptions: 'crollt2k-moredescriptions',
	guildOnly: false,
	args: true,
	usage: '[attribute and/or skill] [ammo] [arguments] [-lang language_code]',
	async run(args, ctx) {
		args.unshift('t2k');
		await ctx.bot.commands.get('roll').run(args, ctx);
	},
};