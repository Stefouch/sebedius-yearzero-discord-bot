const YZEmbed = require('../utils/YZEmbed');
const ms = require('ms');

module.exports = {
	name: 'stats',
	group: 'Administration',
	description: 'Prints bot\'s statistics.',
	adminOnly: true,
	guildOnly: false,
	args: false,
	usage: '',
	async execute(args, message, client) {
		let msg = '';
		let total = 0;
		// Sorts the Discord.Collection in descending order.
		const counts = client.counts.sort((cnt1, cnt2) => cnt2 - cnt1);
		// Iterates the collection.
		for (const [commandName, count] of counts) {
			msg += `${commandName}: **${count}**\n`;
			total += count;
		}
		// Creates a Discord.MessageEmbed and sends it.
		const embed = new YZEmbed('🗒 Commands Statistics', msg)
			.setFooter(`Total: ${total} — Uptime: ${ms(client.uptime)}`);
		return message.channel.send(embed);
	},
};