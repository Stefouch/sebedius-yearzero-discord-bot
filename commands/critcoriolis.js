module.exports = {
	name: 'critcoriolis',
	aliases: ['critc'],
	category: 'coriolis',
	description: 'ccritcoriolis-description',
	guildOnly: false,
	args: false,
	usage: '[table] [numeric] [-private|-p] [-lang language_code]',
	async run(args, ctx) {
		args.unshift('coriolis');
		await ctx.bot.commands.get('crit').run(args, ctx);
	},
};