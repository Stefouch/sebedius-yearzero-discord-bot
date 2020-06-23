const YZEmbed = require('../utils/YZEmbed');

module.exports = {
	name: 'changelog',
	group: 'Core',
	description: 'Prints a link to the official changelog.',
	guildOnly: false,
	args: false,
	usage: '',
	async execute(args, message, client) {
		const embed = new YZEmbed(
			'📑 Sebedius Changelog',
			'You can check out the latest patch notes at '
			+ 'https://github.com/Stefouch/sebedius-myz-discord-bot/blob/master/CHANGELOG.md',
			message,
		);
		return message.channel.send(embed);
	},
};