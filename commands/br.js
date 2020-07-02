module.exports = {
	name: 'br',
	group: 'PBP Tools',
	description: 'Prints a scene break.',
	// aliases: [],
	guildOnly: false,
	args: false,
	usage: '',
	async execute(args, ctx) {
		await ctx.channel.send('``` ```');
		try {
			await ctx.delete();
		}
		catch (err) { console.error(err); }
	},
};