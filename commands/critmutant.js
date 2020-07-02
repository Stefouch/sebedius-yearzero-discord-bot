module.exports = {
	name: 'critmutant',
	group: 'Mutant: Year Zero',
	description: 'Rolls for a random critical injury.'
		+ '\nType `help crit` for more details.',
	aliases: ['critm'],
	guildOnly: false,
	args: false,
	usage: '[table] [numeric]',
	execute(args, ctx) {
		args.unshift('myz');
		ctx.bot.commands.get('crit').execute(args, ctx);
	},
};