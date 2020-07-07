module.exports = {
	name: 'rolltales',
	group: 'Tales From The Loop',
	description: 'Rolls dice for the *Tales From the Loop* roleplaying game.'
		+ '\nType `help roll` for more details.',
	aliases: ['rollt', 'rt', 'lancet', 'lancert', 'slåt', 'slat'],
	guildOnly: false,
	args: true,
	usage: '<dice> [arguments]',
	execute(args, ctx) {
		args.unshift('tales');
		ctx.bot.commands.get('roll').execute(args, ctx);
	},
};