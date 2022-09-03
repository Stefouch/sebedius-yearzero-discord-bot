module.exports = {
	name: 'feral',
	aliases: ['fp'],
	category: 'myz',
	description: 'cferal-description',
	guildOnly: false,
	args: true,
	usage: '<fp> [-lang <language_code>]',
	async run(args, ctx) {
		args.unshift('gla');
		await ctx.bot.commands.get('myzpower').run(args, ctx);
	},
};