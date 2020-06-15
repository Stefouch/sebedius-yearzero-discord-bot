module.exports = {
	name: 'ping',
	description: 'Checks the bot\'s latency.',
	guildOnly: false,
	args: false,
	// usage: '',
	async execute(args, message, client) {
		const msg = await message.channel.send('Pinging...');
		msg.edit(`Pong! Latency is ${msg.createdTimestamp - message.createdTimestamp}ms.`);
	},
};