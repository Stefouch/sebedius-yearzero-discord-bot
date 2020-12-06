const { checkPermissions } = require('../Sebedius');

module.exports = {
	name: 'ping',
	category: 'misc',
	description: 'Checks the bot\'s latency.',
	cooldown: 10,
	guildOnly: false,
	args: false,
	usage: '',
	async run(args, ctx) {
		// Aborts if the bot doesn't have the needed permissions.
		if (!checkPermissions(ctx)) return;

		const msg = await ctx.send('Pinging...');
		return await msg.edit(`Pong! Latency is ${msg.createdTimestamp - ctx.createdTimestamp}ms.`);
	},
};