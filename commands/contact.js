module.exports = {
	name: 'contact',
	aliases: ['ip'],
	category: 'myz',
	description: 'ccontact-description',
	guildOnly: false,
	args: true,
	usage: '<ip> [-lang language_code]',
	async run(args, ctx) {
		args.unshift('ely');
		await ctx.bot.commands.get('myzpower').run(args, ctx);
	},
};