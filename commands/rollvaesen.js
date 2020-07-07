module.exports = {
	name: 'rollvaesen',
	group: 'Vaesen',
	description: 'Rolls dice for the *Vaesen* roleplaying game.'
		+ '\nType `help roll` for more details.',
	aliases: ['rollv', 'rv', 'lancev', 'lancerv', 'slåv', 'slav'],
	guildOnly: false,
	args: true,
	usage: '<dice> [arguments]',
	execute(args, ctx) {
		args.unshift('vaesen');
		ctx.bot.commands.get('roll').execute(args, ctx);
	},
};