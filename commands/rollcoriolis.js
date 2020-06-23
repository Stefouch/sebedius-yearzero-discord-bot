module.exports = {
	name: 'rollcoriolis',
	group: 'Coriolis',
	description: 'Rolls dice for the *Coriolis* roleplaying game.'
		+ '\nType `help roll` for more details.',
	aliases: ['rollc', 'rc', 'lancec', 'lancerc', 'slåc', 'slac'],
	guildOnly: false,
	args: true,
	usage: '<dice> [arguments]',
	execute(args, message, client) {
		args.unshift('coriolis');
		client.commands.get('roll').execute(args, message, client);
	},
};