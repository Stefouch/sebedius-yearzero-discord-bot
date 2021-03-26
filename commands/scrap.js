const { readFileSync } = require('fs');
const { YZEmbed } = require('../utils/embeds');
const { clamp, random } = require('../utils/Util');
const { substitute } = require('../yearzero/YZRoll');
const { __ } = require('../lang/locales');
const SCRAP_MAX = require('../config.json').commands.scrap.max;

module.exports = {
	name: 'scrap',
	aliases: ['junk'],
	category: 'myz',
	description: 'cscrap-description',
	guildOnly: false,
	args: false,
	usage: '[quantity] [-lang <language_code>]',
	async run(args, ctx) {
		// Parses arguments.
		const argv = require('yargs-parser')(args, {
			string: ['lang'],
			alias: {
				lang: ['lng', 'language'],
			},
			default: {
				lang: null,
			},
			configuration: ctx.bot.config.yargs,
		});
		const lang = await ctx.bot.getValidLanguageCode(argv.lang, ctx);

		let desc = '';
		let qty = 1;

		if (/^\d{1,2}$/.test(argv._[0])) {
			qty = clamp(+argv._[0], 1, ctx.bot.config.commands.scrap.max);
		}

		for (let i = 0; i < qty; i++) {
			const scrap = random(getScrapList(lang));

			desc += `\n– ${scrap}`;
		}
		// Dice replacements.
		desc = substitute(desc);

		const title = `${__((qty > 1) ? 'scrap-items' : 'scrap-item', lang)} ${__('found', lang).toLowerCase()}`;
		const embed = new YZEmbed(title, desc, ctx, true);

		return await ctx.send(embed);
	},
};

/**
 * Returns a list of all available scrap items
 * @param {string} language The language to use
 * @returns {string[]} A string array of scrap items
 */
function getScrapList(language = 'en') {
	let scrapList = [__('nothing', language)];
	try {
		const scrapContent = readFileSync(`./gamedata/myz/scrap.${language}.list`, 'utf8');
		scrapList = scrapContent.split('\n');
	}
	catch(error) {
		console.error('[ERROR] - Unable to load the scrap list:', error);
	}
	return scrapList;
}