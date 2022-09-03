module.exports = {
	name: 'module',
	aliases: ['ep'],
	category: 'myz',
	description: 'cmodule-description',
	guildOnly: false,
	args: true,
	usage: '<ep> [-lang <language_code>]',
	async run(args, ctx) {
		args.unshift('mek');
		await ctx.bot.commands.get('myzpower').run(args, ctx);
	},
};