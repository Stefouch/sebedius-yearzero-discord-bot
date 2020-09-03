module.exports = {
	name: 'module',
	aliases: ['ep'],
	category: 'myz',
	description: 'Rolls dice for a Mechatron Module and checks for any Overheating.',
	guildOnly: false,
	args: true,
	usage: '<ep>',
	async run(args, ctx) {
		await ctx.bot.commands.get('myzpower').run(['mek', args[0]], ctx);
	},
};