module.exports = {
	name: 'rollfbl',
	group: 'Forbidden Lands',
	description: 'Rolls dice for the *Forbidden Lands* roleplaying game.'
		+ '\nType `help roll` for more details.',
	aliases: ['rollf', 'rf', 'lancef', 'lancerf', 'slåf', 'slaf'],
	guildOnly: false,
	args: true,
	usage: '<dice> [arguments]',
	async execute(args, ctx) {
		args.unshift('fbl');
		await ctx.bot.commands.get('roll').execute(args, ctx);
	},
};