const fs = require('fs');
const Config = require('../config.json');
const { YZEmbed } = require('../utils/embeds');
const { clamp, random } = require('../utils/Util');
const { substitute } = require('../yearzero/YZRoll');

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
		const scrapContent = fs.readFileSync('./gamedata/myz/scrap.list', 'utf8');
		scrapList = scrapContent.split('\n');
	}
	catch(error) {
		console.error('[ERROR] - Unable to load the scrap list:', error);
	}
	return scrapList;
}