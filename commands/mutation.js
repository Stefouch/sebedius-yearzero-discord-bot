const Muts = require('./data/mutations.list.json');
const YZEmbed = require('../utils/YZEmbed.js');
const { rand } = require('../utils/utils.js');

module.exports = {
	name: 'mutation',
	description: 'Draws a random mutation from the MYZ core rulebook. Addition available sources are:'
		+ '\n• `gla` – Mutant: GenLab Alpha'
		+ '\n• `zc2` – Zone Compendium 2: Dead Blue Sea'
		+ '\n• `zc5` – Zone Compendium 5: Hotel Imperator'
		+ '\nUse `all` to pick from all book sources.',
	aliases: ['mut', 'muta'],
	guildOnly: false,
	args: false,
	usage: '[all | gla zc2 zc5]',
	execute(args, message) {
		// Lists all legal books
		// Using a "Set" object instead of a simple Array,
		// because of easy deletion (see later in the code).
		const legalBooks = new Set();
		for (const book in Muts) legalBooks.add(book);

		// If "all", adds all books.
		if (args.includes('all')) args = args.concat([...legalBooks]);
		// Default book should be MYZ.
		if (!args.includes('myz')) args.push('myz');

		// Using a "Set" object instead of a simple Array,
		// because it avoids duplicates.
		const mutations = new Set();

		// Adds artifacts
		args.forEach(arg => {
			arg = arg.toLowerCase();
			if (legalBooks.has(arg)) {
				Muts[arg].forEach(mut => {
					mutations.add(mut);
				});
				legalBooks.delete(arg);
			}
		});
		const nb = rand(1, mutations.size) - 1;
		const mutation = [...mutations][nb];

		const embed = new YZEmbed('Mutation', mutation);
		message.channel.send(embed);
	},
};