module.exports = {
	name: 'rollmyz',
	aliases: ['rollmutant', 'rollm', 'rm'],
	category: 'myz',
	description: 'Rolls dice for the *Mutant: Year Zero* roleplaying game.'
		+ '\nType `help roll` for more details.',
	guildOnly: false,
	args: true,
	usage: '<dice> [arguments]',
	async run(args, ctx) {
		args.unshift('myz');
		await ctx.bot.commands.get('roll').run(args, ctx);
	},
};