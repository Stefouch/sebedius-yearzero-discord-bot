const { YZEmbed } = require('../utils/embeds');

module.exports = {
	name: 'invite',
	aliases: ['inv'],
	category: 'misc',
	description: 'Prints a link to invite Sebedius to your server.',
	guildOnly: false,
	args: false,
	usage: '',
	async run(args, ctx) {
		const embed = new YZEmbed(
			'🎲 Sebedius Invite',
			'You can invite Sebedius to your server here: '
			+ `${ctx.bot.inviteURL}`,
			ctx,
		);
		return ctx.send(embed);
	},
};