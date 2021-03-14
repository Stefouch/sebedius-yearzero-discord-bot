module.exports = {
	name: 'rolltales',
	aliases: ['rollt', 'rt'],
	category: 'tales',
	description: 'crolltales-description',
	guildOnly: false,
	args: true,
	usage: '<dice> [arguments] [-lang <language_code>]',
	async run(args, ctx) {
		args.unshift('tales');
		await ctx.bot.commands.get('roll').run(args, ctx);
	},
};