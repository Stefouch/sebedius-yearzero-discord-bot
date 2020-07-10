module.exports = {
	name: 'contact',
	group: 'Mutant: Year Zero',
	description: 'Rolls dice for an Elysium Contact and checks for any Backlash.',
	aliases: ['ip'],
	guildOnly: false,
	args: true,
	usage: '<ip>',
	async execute(args, ctx) {
		await ctx.bot.commands.get('myzpower').execute(['ely', args[0]], ctx);
	},
};