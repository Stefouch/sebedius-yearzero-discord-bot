module.exports = {
	name: 'critcoriolis',
	aliases: ['critc'],
	category: 'coriolis',
	description: 'Rolls for a random critical injury.'
		+ '\nType `help crit` for more details.',
	guildOnly: false,
	args: false,
	usage: '[table] [numeric]',
	async run(args, ctx) {
		args.unshift('coriolis');
		await ctx.bot.commands.get('crit').run(args, ctx);
	},
};