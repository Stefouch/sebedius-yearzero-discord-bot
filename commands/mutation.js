module.exports = {
	name: 'mutation',
	aliases: ['mp', 'mut'],
	category: 'myz',
	description: 'cmutation-description',
	guildOnly: false,
	args: true,
	usage: '<mp> [-lang <language_code>]',
	async run(args, ctx) {
		args.unshift('myz');
		await ctx.bot.commands.get('myzpower').run(args, ctx);
	},
};