module.exports = {
	name: 'critalien',
	aliases: ['crita'],
	category: 'alien',
	description: 'ccritalien-description',
	guildOnly: false,
	args: false,
	usage: '[table] [numeric]',
	async run(args, ctx) {
		args.unshift('alien');
		await ctx.bot.commands.get('crit').run(args, ctx);
	},
};