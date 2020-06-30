const YZEmbed = require('../utils/embeds');

module.exports = {
	name: 'prefix',
	group: 'Core',
	description: 'Gets the prefixes for this server.',
	guildOnly: false,
	args: false,
	usage: '[new prefix]',
	async execute(args, message, client) {
		if (args.length) {
			await client.commands.get('setconf').execute(['prefix', args[0]], message, client);
		}
		const msg = `1. ${client.mention}\n2. ${message.prefix}`;
		const embed = new YZEmbed('Sebedius Prefixes', msg).setFooter('2 prefixes');
		return message.channel.send(embed);
	},
};