module.exports = {
	name: 'feral',
	aliases: ['fp'],
	category: 'myz',
	description: 'Rolls dice for a GenLab Alpha Animal Power and checks for any Feral Effect.',
	guildOnly: false,
	args: true,
	usage: '<fp>',
	async run(args, ctx) {
		await ctx.bot.commands.get('myzpower').run(['gla', args[0]], ctx);
	},
};