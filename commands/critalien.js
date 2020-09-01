module.exports = {
	name: 'critalien',
	group: 'Alien RPG',
	description: 'Rolls for a random critical injury.'
		+ '\nType `help crit` for more details.',
	aliases: ['crita'],
	guildOnly: false,
	args: false,
	usage: '[table] [numeric]',
	async execute(args, ctx) {
		args.unshift('alien');
		await ctx.bot.commands.get('crit').execute(args, ctx);
	},
};