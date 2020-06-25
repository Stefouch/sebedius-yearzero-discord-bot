const YZEmbed = require('../utils/embeds');
const Legend = require('../generators/FBLLegendGenerator');

module.exports = {
	name: 'legend',
	group: 'Forbidden Lands',
	description: 'Generates a random legend according to the tables found in'
		+ 'the roleplaying game *Forbidden Lands*.',
	aliases: ['generate-legend'],
	guildOnly: false,
	args: false,
	usage: '',
	async execute(args, message, client) {
		const legend = new Legend();

		const embed = new YZEmbed('Legend', legend.story);

		return message.channel.send(embed);
	},
};