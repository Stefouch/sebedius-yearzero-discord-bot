module.exports = {
	name: 'critalien',
	description: 'Rolls for a random critical injury.'
		+ 'Type `help crit` for more details.',
	aliases: ['crita'],
	guildOnly: false,
	args: false,
	usage: '[table] [numeric]',
	execute(args, message, client) {
		args.unshift('alien');
		client.commands.get('crit').execute(args, message, client);
	},
};