module.exports = {
	name: 'rollfbl',
	aliases: ['rollf', 'rf', 'lancef', 'lancerf', 'slåf', 'slaf'],
	category: 'fbl',
	description: 'Rolls dice for the *Forbidden Lands* roleplaying game.'
		+ '\nType `help roll` for more details.',
	guildOnly: false,
	args: true,
	usage: '<dice> [arguments]',
	async run(args, ctx) {
		args.unshift('fbl');
		await ctx.bot.commands.get('roll').run(args, ctx);
	},
};