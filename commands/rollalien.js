module.exports = {
	name: 'rollalien',
	description: 'Rolls dice for the *ALIEN* roleplaying game.'
		+ '\nType `help roll` for more details.',
	aliases: ['rolla', 'ra', 'lancea', 'lancera', 'slåa', 'slaa'],
	guildOnly: false,
	args: true,
	usage: '<dice> [arguments]',
	execute(args, message, client) {
		args.unshift('alien');
		client.commands.get('roll').execute(args, message, client);
	},
};