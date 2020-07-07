const YZEmbed = require('../utils/embeds');

module.exports = {
	name: 'invite',
	group: 'Core',
	description: 'Prints a link to invite Sebedius to your server.',
	aliases: ['inv'],
	guildOnly: false,
	args: false,
	usage: '',
	async execute(args, ctx) {
		const embed = new YZEmbed(
			'🎲 Sebedius Invite',
			'You can invite Sebedius to your server here: '
			+ `https://discordapp.com/api/oauth2/authorize?client_id=${ctx.bot.config.botID}&scope=bot&permissions=${ctx.bot.config.perms.bitfield}`,
			ctx,
		);
		return ctx.channel.send(embed);
	},
};