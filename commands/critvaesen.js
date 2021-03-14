module.exports = {
	name: 'critvaesen',
	aliases: ['critv'],
	category: 'vaesen',
	description: 'ccritvaesen-description',
	guildOnly: false,
	args: false,
	usage: '[table] [numeric] [-private|-p] [-lang <language_code>]',
	async run(args, ctx) {
		args.unshift('vaesen');
		await ctx.bot.commands.get('crit').run(args, ctx);
	},
};