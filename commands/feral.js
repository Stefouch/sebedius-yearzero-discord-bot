module.exports = {
	name: 'feral',
	aliases: ['fp'],
	category: 'myz',
	description: 'cferal-description',
	guildOnly: false,
	args: true,
	usage: '<fp> [-lang language_code]',
	async run(args, ctx) {
		await ctx.bot.commands.get('myzpower').run(['gla', args[0]], ctx);
	},
};