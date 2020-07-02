module.exports = {
	name: 'ping',
	group: 'Core',
	description: 'Checks the bot\'s latency.',
	guildOnly: false,
	args: false,
	usage: '',
	async execute(args, ctx) {
		const msg = await ctx.channel.send('Pinging...');
		msg.edit(`Pong! Latency is ${msg.createdTimestamp - ctx.createdTimestamp}ms.`);
	},
};