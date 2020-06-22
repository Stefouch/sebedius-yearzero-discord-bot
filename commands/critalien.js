module.exports = {
	name: 'critalien',
	type: 'ALIEN rpg',
	description: 'Rolls for a random critical injury.'
		+ '\nType `help crit` for more details.',
	aliases: ['crita'],
	guildOnly: false,
	args: false,
	usage: '[table] [numeric]',
	execute(args, message, client) {
		args.unshift('alien');
		client.commands.get('crit').execute(args, message, client);
	},
};