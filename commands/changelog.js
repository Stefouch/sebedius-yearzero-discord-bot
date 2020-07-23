const { YZEmbed } = require('../utils/embeds');

module.exports = {
	name: 'changelog',
	group: 'Core',
	description: 'Prints a link to the official changelog.',
	guildOnly: false,
	args: false,
	usage: '',
	async execute(args, ctx) {
		const embed = new YZEmbed(
			'📑 Sebedius Changelog',
			'You can check out the latest patch notes at '
			+ 'https://github.com/Stefouch/sebedius-myz-discord-bot/blob/master/CHANGELOG.md',
			ctx,
		);
		return ctx.channel.send(embed);
	},
};