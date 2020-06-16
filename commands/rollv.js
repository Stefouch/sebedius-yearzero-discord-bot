module.exports = {
	name: 'rollv',
	description: 'Rolls dice for the *Vaesen* roleplaying game.'
		+ 'Type `help roll` for more details.',
	aliases: ['rv', 'lancev', 'lancerv', 'slåv', 'slav'],
	guildOnly: false,
	args: true,
	usage: '<dice> [arguments]',
	execute(args, message, client) {
		args.unshift('vaesen');
		client.commands.get('roll').execute(args, message, client);
	},
};