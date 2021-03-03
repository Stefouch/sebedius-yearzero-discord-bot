module.exports = {
	name: 'rollcoriolis',
	aliases: ['rollc', 'rc'],
	category: 'coriolis',
	description: 'Rolls dice for the *Coriolis* roleplaying game.'
		+ '\nType `help roll` for more details.',
	guildOnly: false,
	args: true,
	usage: '<dice> [arguments]',
	async run(args, ctx) {
		args.unshift('coriolis');
		await ctx.bot.commands.get('roll').run(args, ctx);
	},
};