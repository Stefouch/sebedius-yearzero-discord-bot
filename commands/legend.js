const YZEmbed = require('../util/YZEmbed');
const Legend = require('../util/FBLLegendGenerator');

module.exports = {
	name: 'legend',
	description: 'Generates a random legend according to the tables found in'
		+ 'the roleplaying game *Forbidden Lands*.',
	aliases: ['generate-legend'],
	guildOnly: false,
	args: false,
	async execute(args, message, client) {
		const legend = new Legend();

		const embed = new YZEmbed('Legend', legend.story);

		return message.channel.send(embed);
	},
};