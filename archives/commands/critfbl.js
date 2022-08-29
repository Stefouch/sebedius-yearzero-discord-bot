module.exports = {
	name: 'critfbl',
	aliases: ['critf'],
	category: 'fbl',
	description: 'ccritfbl-description',
	guildOnly: false,
	args: false,
	usage: '[table] [numeric|-lucky [rank]] [-private|-p] [-lang <language_code>]',
	async run(args, ctx) {
		args.unshift('fbl');
		await ctx.bot.commands.get('crit').run(args, ctx);
	},
};