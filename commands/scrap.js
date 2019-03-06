const fs = require('fs');
const Config = require('../config.json');
const YZEmbed = require('../util/YZEmbed');
const Util = require('../util/Util');

// Loading the available scrap.
let scrapList;
try {
	const scrapContent = fs.readFileSync('./data/scrap.list', 'utf8');
	scrapList = scrapContent.split('\n');
	console.log('[+] - Scrap list loaded: data/scrap.list');
}
catch(error) {
	console.error('[ERROR] - Unable to load the scrap list:', error);
}

module.exports = {
	name: 'scrap',
	description: `Gets random scrap. Max ${Config.commands.scrap.max} items.`,
	aliases: ['junk'],
	guildOnly: false,
	args: false,
	usage: '[quantity]',
	execute(args, message) {
		let desc = '';
		let qty = 1;

		if (/^\d{1,2}$/.test(args[0])) {
			qty = Math.min(+args[0], Config.commands.scrap.max);
		}

		for (let i = 0; i < qty; i++) {
			const scrap = Util.random(scrapList);

			desc += `\n– ${scrap}`;
		}
		// Dice replacements.
		desc = desc.replace(/D666/gmi, Util.rollD666());
		desc = desc.replace(/D66/gmi, Util.rollD66());
		desc = desc.replace(/(\d)D6/gmi, (match, p1) => Util.sumD6(p1));
		desc = desc.replace(/D6/gmi, Util.rand(1, 6));

		const title = `Scrap Item${(qty > 1) ? 's' : ''} Found`;
		const embed = new YZEmbed(title, desc, message, true);

		return message.channel.send(embed);
	},
};