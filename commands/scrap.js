const fs = require('fs');
const Config = require('../config.json');
const { YZEmbed } = require('../utils/embeds');
const { RollParser } = require('../utils/RollParser');
const Util = require('../utils/Util');

module.exports = {
	name: 'scrap',
	group: 'Mutant: Year Zero',
	description: `Gets random scrap. Max ${Config.commands.scrap.max} items.`,
	aliases: ['junk'],
	guildOnly: false,
	args: false,
	usage: '[quantity]',
	async execute(args, ctx) {
		let desc = '';
		let qty = 1;

		if (/^\d{1,2}$/.test(args[0])) {
			qty = Util.clamp(+args[0], 1, ctx.bot.config.commands.scrap.max);
		}

		for (let i = 0; i < qty; i++) {
			const scrap = Util.random(getScrapList());

			desc += `\n– ${scrap}`;
		}
		// Dice replacements.
		desc = RollParser.supersede(desc);

		const title = `Scrap Item${(qty > 1) ? 's' : ''} Found`;
		const embed = new YZEmbed(title, desc, ctx, true);

		return ctx.channel.send(embed);
	},
};

function getScrapList() {
	let scrapList;
	try {
		const scrapContent = fs.readFileSync('./gamedata/myz/scrap.list', 'utf8');
		scrapList = scrapContent.split('\n');
		// console.log('[+] - Scrap list loaded: data/scrap.list');
	}
	catch(error) {
		console.error('[ERROR] - Unable to load the scrap list:', error);
	}
	return scrapList;
}