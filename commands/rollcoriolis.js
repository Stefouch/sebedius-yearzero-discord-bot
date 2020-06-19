module.exports = {
	name: 'rollcoriolis',
	description: 'Rolls dice for the *Coriolis* roleplaying game.'
		+ 'Type `help roll` for more details.',
	aliases: ['rollc', 'rc', 'lancec', 'lancerc', 'slåc', 'slac'],
	guildOnly: false,
	args: true,
	usage: '<dice> [arguments]',
	execute(args, message, client) {
		args.unshift('coriolis');
		client.commands.get('roll').execute(args, message, client);
	},
};