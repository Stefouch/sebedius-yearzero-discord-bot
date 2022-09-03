module.exports = {
	name: 'rollvaesen',
	aliases: ['rollv', 'rv'],
	category: 'vaesen',
	description: 'crollvaesen-description',
	guildOnly: false,
	args: true,
	usage: '<dice> [arguments] [-lang <language_code>]',
	async run(args, ctx) {
		args.unshift('vaesen');
		await ctx.bot.commands.get('roll').run(args, ctx);
	},
};