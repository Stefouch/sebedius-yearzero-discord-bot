module.exports = {
	name: 'critmutant',
	group: 'Mutant: Year Zero',
	description: 'Rolls for a random critical injury.'
		+ '\nType `help crit` for more details.',
	aliases: ['critm'],
	guildOnly: false,
	args: false,
	usage: '[table] [numeric]',
	execute(args, message, client) {
		args.unshift('myz');
		client.commands.get('crit').execute(args, message, client);
	},
};