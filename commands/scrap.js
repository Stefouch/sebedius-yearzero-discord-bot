const fs = require('fs');
const Config = require('../config.json');
const { rand } = require('../utils/utils.js');

// Loading the available scrap.
let scrapList;
try {
	const scrapContent = fs.readFileSync('./sheets/scrap.list', 'utf8');
	scrapList = scrapContent.split('\n');
	console.log('[+] - Scrap list loaded: sheets/scrap.list');
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
		let text = '';
		let qty = 1;

		if (/^\d{1,2}$/.test(args[0])) {
			qty = Math.min(Number(args[0]), Config.commands.scrap.max);
		}

		for (let i = 0; i < qty; i++) {
			const roll = rand(1, scrapList.length) - 1;
			const scrap = scrapList[roll];

			text += `\n– ${scrap}`;
		}
		// Dice replacements.
		text = text.replace(/D666/gmi, rand(1, 6) * 100 + rand(1, 6) * 10 + rand(1, 6));
		text = text.replace(/D66/gmi, rand(1, 6) * 10 + rand(1, 6));
		text = text.replace(/(\d)D6/gmi, (correspondance, p1, decalage, chaine) => {
			// Help: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/String/replace#Indiquer_une_fonction_comme_param%C3%A8tre
			const nbre = Number(p1);
			let roll = 0;
			for (let i = 0; i < nbre; i++) {
				roll += rand(1, 6);
			}
			return roll;
		});
		text = text.replace(/D6/gmi, rand(1, 6));

		const authorColor = (message.channel.type === 'text') ? message.member.colorRole.color : 0x1AA29B;

		const embed = {
			color: authorColor,
			title: `Scrap Item${(qty > 1) ? 's' : ''} Found`,
			author: {
				name: message.author.username,
				icon_url: message.author.avatarURL,
			},
			description: text,
			timestamp: new Date(),
		};

		message.channel.send({ embed: embed });
	},
};