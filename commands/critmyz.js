module.exports = {
	name: 'critmyz',
	group: 'Mutant: Year Zero',
	description: 'Rolls for a random critical injury.'
		+ '\nType `help crit` for more details.',
	aliases: ['critm', 'critmutant'],
	guildOnly: false,
	args: false,
	usage: '[table] [numeric]',
	async execute(args, ctx) {
		args.unshift('myz');
		await ctx.bot.commands.get('crit').execute(args, ctx);
	},
};