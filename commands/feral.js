module.exports = {
	name: 'feral',
	group: 'Mutant: Year Zero',
	description: 'Rolls dice for a GenLab Alpha Animal Power and checks for any Feral Effect.',
	aliases: ['fp'],
	guildOnly: false,
	args: true,
	usage: '<fp>',
	async execute(args, ctx) {
		await ctx.bot.commands.get('myzpower').execute(['gla', args[0]], ctx);
	},
};