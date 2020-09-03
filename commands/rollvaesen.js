module.exports = {
	name: 'rollvaesen',
	aliases: ['rollv', 'rv', 'lancev', 'lancerv', 'slåv', 'slav'],
	category: 'vaesen',
	description: 'Rolls dice for the *Vaesen* roleplaying game.'
		+ '\nType `help roll` for more details.',
	guildOnly: false,
	args: true,
	usage: '<dice> [arguments]',
	async run(args, ctx) {
		args.unshift('vaesen');
		await ctx.bot.commands.get('roll').run(args, ctx);
	},
};