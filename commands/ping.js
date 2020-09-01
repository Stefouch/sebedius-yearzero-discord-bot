const { checkPermissions } = require('../Sebedius');

module.exports = {
	name: 'ping',
	group: 'Other',
	description: 'Checks the bot\'s latency.',
	guildOnly: false,
	args: false,
	usage: '',
	async execute(args, ctx) {
		// Aborts if the bot doesn't have the needed permissions.
		if (!checkPermissions(ctx)) return;

		const msg = await ctx.channel.send('Pinging...');
		return await msg.edit(`Pong! Latency is ${msg.createdTimestamp - ctx.createdTimestamp}ms.`);
	},
};