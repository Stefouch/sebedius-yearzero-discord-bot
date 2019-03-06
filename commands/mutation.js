const Muts = require('./data/mutations.list.json');
const YZEmbed = require('../util/YZEmbed');
const { random } = require('../util/Util');

module.exports = {
	name: 'mutation',
	description: 'Draws a random mutation from the MYZ core rulebook. Available sources are:'
		+ '\n• `gla` – Adds *Mutant: GenLab Alpha* mutations'
		+ '\n• `zc2` – Adds *Zone Compendium 2: Dead Blue Sea* mutations'
		+ '\n• `zc5` – Adds *Zone Compendium 5: Hotel Imperator* mutations'
		+ '\n• `psi` – Draws only from Psionic/mental mutations'
		+ '\nUse `all` to pick from all book sources.',
	aliases: ['mut', 'muta'],
	guildOnly: false,
	args: false,
	usage: '[all | gla zc2 zc5 psi]',
	execute(args, message) {
		// Lists all legal books
		const legalBooks = new Array();
		for (const book in Muts) legalBooks.push(book);

		// If "all", adds all books.
		if (args.includes('all')) args = args.concat(legalBooks);
		// Default book should be MYZ.
		if (!args.includes('myz') && !args.includes('psi')) args.push('myz');

		// Using a "Set" object instead of a simple Array,
		// because it avoids duplicates.
		const mutations = new Set();

		// Adds artifacts
		args.forEach(arg => {
			arg = arg.toLowerCase();
			if (legalBooks.includes(arg)) {
				Muts[arg].forEach(mut => mutations.add(mut));
			}
		});

		const mutation = random(mutations);
		const embed = new YZEmbed('Mutation', mutation);

		return message.channel.send(embed);
	},
};