module.exports = {
	name: 'rollcoriolis',
	aliases: ['rollc', 'rc'],
	category: 'coriolis',
	description: 'crollcoriolis-description',
	guildOnly: false,
	args: true,
	usage: '<dice> [arguments] [-lang <language_code>]',
	async run(args, ctx) {
		args.unshift('coriolis');
		await ctx.bot.commands.get('roll').run(args, ctx);
	},
};