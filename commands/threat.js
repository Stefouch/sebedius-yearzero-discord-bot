const Threats = require('./data/threats.list.json');
const YZEmbed = require('../util/YZEmbed');
const { rand, rollD66, capitalize } = require('../util/Util');

module.exports = {
	name: 'threat',
	description: 'Draws a random Zone threat.',
	aliases: ['thr'],
	guildOnly: false,
	args: false,
	execute(args, message) {
		// Rolls for the threat type.
		const nb = rand(1, 6);
		let type;

		if (nb <= 2) type = 'humanoids';
		else if (nb <= 5) type = 'monsters';
		else type = 'phenomenons';

		// Collects the list of the threats for the chosen type.
		const threats = Threats.myz[type];

		// Rolls for the threat from the chosen type.
		const rnd = rollD66();
		let threat;

		for (let i = rnd; i > 10; i--) {
			if (`${i}` in threats && rnd >= i) {
				threat = threats[`${i}`];
				break;
			}
		}

		const typeStr = capitalize(type).slice(0, -1);
		const embed = new YZEmbed('Zone Threat', `${typeStr} – ${threat}`);

		return message.channel.send(embed);
	},
};