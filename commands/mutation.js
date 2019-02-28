const Mutations = require('./data/mutations.list.json');
const YZEmbed = require('../utils/YZEmbed.js');
const { rand } = require('../utils/utils.js');

module.exports = {
	name: 'mutation',
	description: 'Draws a random mutation.',
	aliases: ['mut', 'muta'],
	guildOnly: false,
	args: false,
	// usage: '[numeric]',
	execute(args, message) {
		const nb = rand(1, Mutations.length) - 1;
		const embed = new YZEmbed('Mutation', Mutations[nb]);
		message.channel.send(embed);
	},
};