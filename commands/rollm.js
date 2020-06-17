module.exports = {
	name: 'rollm',
	description: 'Rolls dice for the *Mutant: Year Zero* roleplaying game.'
		+ 'Type `help roll` for more details.',
	aliases: ['rm', 'lancem', 'lancerm', 'slåm', 'slam'],
	guildOnly: false,
	args: true,
	usage: '<dice> [arguments]',
	execute(args, message, client) {
		args.unshift('myz');
		client.commands.get('roll').execute(args, message, client);
	},
};