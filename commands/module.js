module.exports = {
	name: 'module',
	group: 'Mutant: Year Zero',
	description: 'Rolls dice for a Mechatron Module and checks for any Overheating.',
	aliases: ['ep'],
	guildOnly: false,
	args: true,
	usage: '<ep>',
	async execute(args, ctx) {
		await ctx.bot.commands.get('myzpower').execute(['mec', args[0]], ctx);
	},
};