module.exports = {
	name: 'critmyz',
	aliases: ['critm', 'critmutant'],
	category: 'myz',
	description: 'ccritmyz-description',
	guildOnly: false,
	args: false,
	usage: '[table] [numeric]',
	async run(args, ctx) {
		args.unshift('myz');
		await ctx.bot.commands.get('crit').run(args, ctx);
	},
};