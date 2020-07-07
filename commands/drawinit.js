const Sebedius = require('../Sebedius');
const Util = require('../utils/Util');
const { CARDS_ICONS } = require('../utils/constants');
const YZInitDeck = require('../yearzero/YZInitDeck');

module.exports = {
	name: 'drawinit',
	group: 'Core',
	description: 'Draws one or more initiative cards. The deck is specific to each Discord server.\n\n'
		+ `__Parameter__
		• \`[speed]\` – Number of initiative cards to draw. Default: 1.

		__Arguments__
		• \`[-haste <value>]\` – Draws more initiative cards and keeps the best one. The other are shuffled back into the deck before others draw their cards. Use this for special talents like *Lightning Fast*. Default: 1.
		• \`[-shuffle]\` – Resets the deck. *(Which is probably needed at the beginning of every new encounter.)*`,
	aliases: ['draw-init', 'drawinitiative'],
	guildOnly: false,
	args: false,
	usage: '[speed] [-haste <value>] [-shuffle]',
	async execute(args, ctx) {
		const argv = require('yargs-parser')(args, {
			boolean: ['shuffle'],
			number: ['haste'],
			default: {
				shuffle: false,
				haste: 1,
			},
			configuration: ctx.bot.config.yargs,
		});
		const speed = Util.clamp(+argv._[0], 1, 10) || 1;
		const haste = Util.clamp(+argv.haste, 1, 10) || 1;
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
		const drawnCards = [];
		for (let i = 0; i < speed; i++) {
			if (i > deck.size || haste > deck.size) {
				out.push(':information_source: The size of the *Initiative* deck is too small.');
				await reset();
			}
			if (haste > 1) {
				drawnCards.push(...deck.loot(haste, 1, (a, b) => a - b, true));
			}
			else {
				drawnCards.push(deck.draw());
			}
		}
		console.log(`[INITIATIVE DECK] - Cards drawn: [${drawnCards}]`);

		out.push(getDrawCardText(drawnCards, ctx));
		await ctx.bot.kdb.initiatives.set(gid, deck._stack, ttl);
		return ctx.channel.send(out.join('\n'));

		async function reset() {
			deck = new YZInitDeck();
			out.push(':arrows_clockwise: Shuffled a new deck of *Initiative* cards.');
		}
	},
};

function getDrawCardText(cards, ctx) {
	if (!Array.isArray(cards)) return getDrawCardText([cards]);
	return `${Sebedius.getMention(ctx.member)} **Initiative:** ${cards.map(c => CARDS_ICONS[c]).join(' ')}`;
}