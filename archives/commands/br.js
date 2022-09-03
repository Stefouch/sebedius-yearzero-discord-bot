module.exports = {
	name: 'br',
	// aliases: [],
	category: 'pbptool',
	description: 'cbr-description',
	guildOnly: false,
	args: false,
	usage: '',
	async run(args, ctx) {
		await ctx.send('``` ```');
		try {
			await ctx.delete();
		}
		catch (err) { console.error(err); }
	},
};