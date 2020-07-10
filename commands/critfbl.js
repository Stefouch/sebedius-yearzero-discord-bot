module.exports = {
	name: 'critfbl',
	group: 'Forbidden Lands',
	description: 'Rolls for a random critical injury.'
		+ '\nType `help crit` for more details.',
	aliases: ['critf'],
	guildOnly: false,
	args: false,
	usage: '[table] [numeric]',
	async execute(args, ctx) {
		args.unshift('fbl');
		await ctx.bot.commands.get('crit').execute(args, ctx);
	},
};