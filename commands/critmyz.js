module.exports = {
	name: 'critmyz',
	aliases: ['critm', 'critmutant'],
	category: 'myz',
	description: 'Rolls for a random critical injury.'
		+ '\nType `help crit` for more details.',
	guildOnly: false,
	args: false,
	usage: '[table] [numeric]',
	async run(args, ctx) {
		args.unshift('myz');
		await ctx.bot.commands.get('crit').run(args, ctx);
	},
};