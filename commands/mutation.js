module.exports = {
	name: 'mutation',
	group: 'Mutant: Year Zero',
	description: 'Rolls dice for a Mutation and checks for any Misfire.',
	aliases: ['mp', 'mut'],
	guildOnly: false,
	args: true,
	usage: '<mp>',
	async execute(args, ctx) {
		await ctx.bot.commands.get('myzpower').execute(['myz', args[0]], ctx);
	},
};