module.exports = {
	name: 'br',
	// aliases: [],
	category: 'pbptool',
	description: 'Prints a scene break.',
	guildOnly: false,
	args: false,
	usage: '',
	async run(args, ctx) {
		await ctx.channel.send('``` ```');
		try {
			await ctx.delete();
		}
		catch (err) { console.error(err); }
	},
};