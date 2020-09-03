module.exports = {
	name: 'rolltales',
	aliases: ['rollt', 'rt', 'lancet', 'lancert', 'slåt', 'slat'],
	category: 'tales',
	description: 'Rolls dice for the *Tales From the Loop* roleplaying game.'
		+ '\nType `help roll` for more details.',
	guildOnly: false,
	args: true,
	usage: '<dice> [arguments]',
	async run(args, ctx) {
		args.unshift('tales');
		await ctx.bot.commands.get('roll').run(args, ctx);
	},
};