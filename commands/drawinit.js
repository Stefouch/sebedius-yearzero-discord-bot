const { getMention } = require('../Sebedius');
const { clamp } = require('../utils/Util');
const { CARDS_ICONS } = require('../utils/constants');
const YZInitDeck = require('../yearzero/YZInitDeck');
const { __ } = require('../lang/locales');

module.exports = {
	name: 'drawinit',
	aliases: ['draw-init', 'drawinitiative'],
	category: 'common',
	description: 'cdrawinit-description',
	guildOnly: true,
	args: false,
	usage: '[speed] [-haste <value>] [-shuffle] [-lang language_code]',
	async run(args, ctx) {
		const argv = require('yargs-parser')(args, {
			boolean: ['shuffle'],
			number: ['haste'],
			string: ['lang'],
			alias: {
				schuffle: ['mischen'],
				haste: ['blitzschnell', 'schnell'],
				lang: ['lng', 'language'],
			},
			default: {
				shuffle: false,
				haste: 1,
				alias: null,
			},
			configuration: ctx.bot.config.yargs,
		});

		const lang = await ctx.bot.getValidLanguageCode(argv.lang, ctx);
		const speed = clamp(+argv._[0], 1, 10) || 1;
		const haste = clamp(+argv.haste, 1, 10) || 1;
		const shuffle = argv.shuffle ? true : false;

		// Initializes the card database.
		const gid = ctx.guild.id;
		const ttl = 86400000;
		const out = [];

		// Recreates the deck.
		const cards = await ctx.bot.kdb.initiatives.get(gid);
		let deck;

		if (shuffle || !cards || cards.length === 0) {
			await reset();
		}
		else {
			deck = new YZInitDeck(cards);
		}
		const drawnCards = [], drawnHasteCards = [];
		for (let i = 0; i < speed; i++) {
			if (i > deck.size || haste > deck.size) {
				out.push(':information_source: ' + __('cdrawinit-deck-too-small', lang));
				await reset();
			}
			if (haste > 1) {
				let lootedCards = deck.loot(haste, 1, (a, b) => a - b, true);
				drawnCards.push(lootedCards[0]);
				drawnHasteCards.push(lootedCards[1]);
			}
			else {
				drawnCards.push(deck.draw());
			}
		}
		console.log(`[INITIATIVE DECK] - Cards drawn: [${drawnCards}] Haste-Pool: [${drawnHasteCards}]`);

		out.push(getHastePoolText(drawnHasteCards, lang));
		out.push(getDrawCardText(drawnCards, ctx, lang));
		await ctx.bot.kdb.initiatives.set(gid, deck._stack, ttl);
		return ctx.send(out.join('\n'));

		async function reset() {
			deck = new YZInitDeck();
			out.push(':arrows_clockwise: ' + __('cdrawinit-shuffled', lang));
		}
	},
};

function getDrawCardText(cards, ctx, lang) {
	if (!Array.isArray(cards)) return getDrawCardText([cards], ctx, lang);
	return `${getMention(ctx.member)} **${__('initiative', lang)}:** ${cards.map(c => CARDS_ICONS[c]).join(' ')}`;
}
/**
 * Gets the `Haste` pool's text.
 * @param {Array} cards An array of looted cards
 * @param {string} lang The language code for the localisation
 * @returns {string}
 */
function getHastePoolText(cards, lang) {
	if (!Array.isArray(cards) || cards.length == 0) return '';
	return `${__('cdrawinit-hastepool', lang)}: ` + cards.map(c => `[${c}]`).join(', ');
}
