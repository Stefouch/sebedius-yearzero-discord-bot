const Threats = require('./data/threats.list.json');
const YZEmbed = require('../utils/YZEmbed.js');
const { rand, capitalize } = require('../utils/utils.js');

module.exports = {
	name: 'threat',
	description: 'Draws a random Zone threat.',
	aliases: ['thr'],
	guildOnly: false,
	args: false,
	execute(args, message) {
		const nb = rand(1, 6);
		let type;

		if (nb <= 2) type = 'humanoids';
		else if (nb <= 5) type = 'monsters';
		else type = 'phenomenons';

		const threats = Threats.myz[type];
		const rnd = rand(1, 6) * 10 + rand(1, 6);
		let threat;

		for (let i = rnd; i > 10; i--) {
			if (`${i}` in threats && rnd >= i) {
				threat = threats[`${i}`];
				break;
			}
		}

		const typeStr = capitalize(type).slice(0, -1);
		const embed = new YZEmbed('Zone Threat', `${typeStr} – ${threat}`);
		message.channel.send(embed);
	},
};