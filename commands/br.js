module.exports = {
	name: 'br',
	group: 'PBP Tools',
	description: 'Prints a scene break.',
	// aliases: [],
	guildOnly: false,
	args: false,
	usage: '',
	async execute(args, message, client) {
		return message.channel.send('``` ```');
	},
};