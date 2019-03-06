const YZEmbed = require('../util/YZEmbed');
const Demon = require('../util/YZDemonGenerator');
const Util = require('../util/Util');

module.exports = {
	name: 'demon',
	description: 'Generates a random demon according to the tables found in'
		+ ' the roleplaying game *Forbidden Lands*',
	aliases: ['generate-demon'],
	guildOnly: false,
	args: false,
	execute(args, message) {
		const demon = new Demon();
		console.log(demon);
	},
};