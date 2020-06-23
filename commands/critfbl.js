module.exports = {
	name: 'critfbl',
	group: 'Forbidden Lands',
	description: 'Rolls for a random critical injury.'
		+ '\nType `help crit` for more details.',
	aliases: ['critf'],
	guildOnly: false,
	args: false,
	usage: '[table] [numeric]',
	execute(args, message, client) {
		args.unshift('fbl');
		client.commands.get('crit').execute(args, message, client);
	},
};