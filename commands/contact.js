module.exports = {
	name: 'contact',
	aliases: ['ip'],
	category: 'myz',
	description: 'Rolls dice for an Elysium Contact and checks for any Backlash.',
	guildOnly: false,
	args: true,
	usage: '<ip>',
	async run(args, ctx) {
		await ctx.bot.commands.get('myzpower').run(['ely', args[0]], ctx);
	},
};