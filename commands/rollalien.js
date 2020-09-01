module.exports = {
	name: 'rollalien',
	group: 'Alien RPG',
	description: 'Rolls dice for the *ALIEN* roleplaying game.'
		+ '\nType `help roll` for more details.',
	aliases: ['rolla', 'ra', 'lancea', 'lancera', 'slåa', 'slaa'],
	guildOnly: false,
	args: true,
	usage: '<dice> [arguments]',
	async execute(args, ctx) {
		args.unshift('alien');
		await ctx.bot.commands.get('roll').execute(args, ctx);
	},
};