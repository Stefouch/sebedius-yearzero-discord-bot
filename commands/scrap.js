const { readFileSync } = require('fs');
const { YZEmbed } = require('../utils/embeds');
const { clamp, random } = require('../utils/Util');
const { substitute } = require('../yearzero/YZRoll');
const SCRAP_MAX = require('../config.json').commands.scrap.max;

module.exports = {
	name: 'scrap',
	aliases: ['junk'],
	category: 'myz',
	description: `Gets random scrap. Max ${SCRAP_MAX} items.`,
	guildOnly: false,
	args: false,
	usage: '[quantity]',
	async run(args, ctx) {
		let desc = '';
		let qty = 1;

		if (/^\d{1,2}$/.test(args[0])) {
			qty = clamp(+args[0], 1, ctx.bot.config.commands.scrap.max);
		}

		for (let i = 0; i < qty; i++) {
			const scrap = random(getScrapList());

			desc += `\n– ${scrap}`;
		}
		// Dice replacements.
		desc = substitute(desc);

		const title = `Scrap Item${(qty > 1) ? 's' : ''} Found`;
		const embed = new YZEmbed(title, desc, ctx, true);

		return await ctx.channel.send(embed);
	},
};

function getScrapList() {
	let scrapList;
	try {
		const scrapContent = readFileSync('./gamedata/myz/scrap.list', 'utf8');
		scrapList = scrapContent.split('\n');
	}
	catch(error) {
		console.error('[ERROR] - Unable to load the scrap list:', error);
	}
	return scrapList;
}