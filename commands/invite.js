const YZEmbed = require('../util/YZEmbed');

module.exports = {
	name: 'invite',
	group: 'Core',
	description: 'Prints a link to invite Sebedius to your server.',
	aliases: ['inv'],
	guildOnly: false,
	args: false,
	usage: '',
	async execute(args, message, client) {
		const embed = new YZEmbed(
			'🎲 Sebedius Invite',
			'You can invite Sebedius to your server here: '
			+ `https://discordapp.com/api/oauth2/authorize?client_id=${client.config.botID}&scope=bot&permissions=${client.config.perms.bitfield}`,
			message,
		);
		return message.channel.send(embed);
	},
};