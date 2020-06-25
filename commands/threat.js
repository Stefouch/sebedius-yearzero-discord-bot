const Threats = require('../gamedata/threats.list.json');
const YZEmbed = require('../utils/embeds');
const Util = require('../utils/Util');

module.exports = {
	name: 'threat',
	group: 'Mutant: Year Zero',
	description: 'Draws a random Zone threat.',
	aliases: ['thr'],
	guildOnly: false,
	args: false,
	usage: '',
	async execute(args, message, client) {
		// Rolls for the threat type.
		const nb = Util.rand(1, 6);
		let type;

		if (nb <= 2) type = 'humanoids';
		else if (nb <= 5) type = 'monsters';
		else type = 'phenomenons';

		// Collects the list of the threats for the chosen type.
		const threats = Threats.myz[type];

		// Rolls for the threat from the chosen type.
		const rnd = Util.rollD66();
		let threat;

		for (let i = rnd; i > 10; i--) {
			if (`${i}` in threats && rnd >= i) {
				threat = threats[`${i}`];
				break;
			}
		}

		const typeStr = Util.capitalize(type).slice(0, -1);
		const embed = new YZEmbed('Zone Threat', `${typeStr} – ${threat}`);

		return message.channel.send(embed);
	},
};