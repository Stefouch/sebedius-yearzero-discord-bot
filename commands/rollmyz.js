module.exports = {
	name: 'rollmyz',
	group: 'Mutant: Year Zero',
	description: 'Rolls dice for the *Mutant: Year Zero* roleplaying game.'
		+ '\nType `help roll` for more details.',
	aliases: ['rollm', 'rm', 'lancem', 'lancerm', 'slåm', 'slam'],
	guildOnly: false,
	args: true,
	usage: '<dice> [arguments]',
	async execute(args, ctx) {
		args.unshift('myz');
		await ctx.bot.commands.get('roll').execute(args, ctx);
	},
};