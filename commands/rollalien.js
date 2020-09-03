module.exports = {
	name: 'rollalien',
	aliases: ['rolla', 'ra', 'lancea', 'lancera', 'slåa', 'slaa'],
	category: 'alien',
	description: 'Rolls dice for the *ALIEN* roleplaying game.'
		+ '\nType `help roll` for more details.',
	guildOnly: false,
	args: true,
	usage: '<dice> [arguments]',
	async run(args, ctx) {
		args.unshift('alien');
		await ctx.bot.commands.get('roll').run(args, ctx);
	},
};