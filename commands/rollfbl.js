module.exports = {
	name: 'rollfbl',
	aliases: ['rollf', 'rf'],
	category: 'fbl',
	description: 'crollfbl-description',
	guildOnly: false,
	args: true,
	usage: '<dice> [arguments] [-lang language-code]',
	async run(args, ctx) {
		args.unshift('fbl');
		await ctx.bot.commands.get('roll').run(args, ctx);
	},
};