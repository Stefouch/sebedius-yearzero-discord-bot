const Util = require('../utils/Util');
const { CARDS_ICONS } = require('../utils/constants');
const YZInitDeck = require('../yearzero/YZInitDeck');

module.exports = {
	name: 'drawinit',
	group: 'Core',
	description: 'Draws one or more initiative cards. The deck is specific to each Discord channel.'
		+ 'Use the parameter `shuffle` to reset it. *(Which is probably needed at the beginning of every new encounter.)*',
	aliases: ['draw-init', 'drawinitiative'],
	guildOnly: false,
	args: false,
	usage: '[quantity] [shuffle]',
	async execute(args, message, client) {
		// Initializes the card database.
		const gid = message.guild.id;
		const ttl = 86400000;

		// Recreates the deck.
		const cards = await client.kdb.initiatives.get(gid, 'initiative');
		//const cards = await db.get(gid, 'initiative');
		let deck;

		if (cards && cards.length > 0) {
			deck = new YZInitDeck(cards);
		}
		else {
			await reset();
		}

		// Command: Shuffles a new deck of cards.
		if (args.includes('shuffle')) {
			await reset();
		}
		// Command: Draws cards.
		else {
			// Gets the card.
			const value = +args[0] || 1;
			const drawQty = Util.clamp(value, 0, 10);

			if (drawQty > deck.size) {
				message.channel.send('The size of the *Initiative* deck is too small.');
				await reset();
			}
			const drawnCards = deck.draw(drawQty);
			console.log(`[INITIATIVE DECK] - Cards drawn: [${drawnCards}]`);
			await client.kdb.initiatives.set(gid, deck._stack, ttl);
			//await db.set(gid, deck._stack, 'initiative', ttl);
			return message.reply(getDrawCardText(drawnCards, CARDS_ICONS));
		}

		async function reset() {
			deck = new YZInitDeck();
			await client.kdb.initiatives.set(gid, deck._stack, ttl);
			//await db.set(gid, deck._stack, 'initiative', ttl);
			return message.channel.send('Shuffled a new deck of *Initiative* cards.');
		}
	},
};

function getDrawCardText(cards, cardIcons) {
	if (!Array.isArray(cards)) return getDrawCardText([cards], cardIcons);

	const cardTexts = [];
	cards.forEach(card => {
		cardTexts.push(cardIcons[card]);
	});
	return '**Initiative:** ' + cardTexts.join(', ');
}