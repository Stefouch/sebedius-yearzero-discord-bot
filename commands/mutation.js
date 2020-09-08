module.exports = {
	name: 'mutation',
	aliases: ['mp', 'mut'],
	category: 'myz',
	description: 'Rolls dice for a Mutation and checks for any Misfire.',
	guildOnly: false,
	args: true,
	usage: '<mp>',
	async run(args, ctx) {
		await ctx.bot.commands.get('myzpower').run(['myz', args[0]], ctx);
	},
};