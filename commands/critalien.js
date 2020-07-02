module.exports = {
	name: 'critalien',
	group: 'ALIEN rpg',
	description: 'Rolls for a random critical injury.'
		+ '\nType `help crit` for more details.',
	aliases: ['crita'],
	guildOnly: false,
	args: false,
	usage: '[table] [numeric]',
	execute(args, ctx) {
		args.unshift('alien');
		ctx.bot.commands.get('crit').execute(args, ctx);
	},
};