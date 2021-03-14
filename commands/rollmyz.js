module.exports = {
	name: 'rollmyz',
	aliases: ['rollmutant', 'rollm', 'rm'],
	category: 'myz',
	description: 'crollmyz-description',
	guildOnly: false,
	args: true,
	usage: '<dice> [arguments] [-lang language_code]',
	async run(args, ctx) {
		args.unshift('myz');
		await ctx.bot.commands.get('roll').run(args, ctx);
	},
};