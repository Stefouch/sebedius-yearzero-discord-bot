module.exports = {
	name: 'rollalien',
	aliases: ['rolla', 'ra'],
	category: 'alien',
	description: 'crollalien-description',
	guildOnly: false,
	args: true,
	usage: '<dice> [arguments] [-lang <language_code>]',
	async run(args, ctx) {
		args.unshift('alien');
		await ctx.bot.commands.get('roll').run(args, ctx);
	},
};