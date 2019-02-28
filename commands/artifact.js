const Artos = require('./data/artifacts.list.json');
const YZEmbed = require('../utils/YZEmbed.js');
const { rand } = require('../utils/utils.js');

module.exports = {
	name: 'artifact',
	description: 'Draws a random artifact. Available sources are:'
		+ '\n• `gla` – Mutant: GenLab Alpha'
		+ '\n• `mech` – Mutant: Mechatron'
		+ '\n• `ely` – Mutant: Elysium'
		+ '\n• `astra` – Mutant: Ad Astra'
		+ '\nMetaplot items are removed by default. Use `meta` to add them to the roll.'
		+ '\nUse `all` to pick from all book sources.',
	aliases: ['arto'],
	guildOnly: false,
	args: false,
	usage: '[gla] [mech] [ely] [astra] [meta]',
	execute(args, message) {
		// Lists all legal books
		// Using a "Set" object instead of a simple Array,
		// because of easy deletion (see later in the code).
		const legalBooks = new Set();
		for (const book in Artos) legalBooks.add(book);

		// Default book should be MYZ.
		if (!args.includes('myz')) args.push('myz');
		// If "all", adds all books.
		if (args.includes('all')) args.concat(legalBooks);

		// Using a "Set" object instead of a simple Array,
		// because it avoids duplicates.
		const artifacts = new Set();

		// Adds artifacts
		args.forEach(arg => {
			arg = arg.toLowerCase();
			if (legalBooks.has(arg)) {
				Artos[arg].forEach(arto => {
					artifacts.add(arto);
				});
				legalBooks.delete(arg);
			}
		});
		const nb = rand(1, artifacts.size) - 1;
		const artifact = Array.from(artifacts)[nb];

		const embed = new YZEmbed('Artifact', artifact);
		message.channel.send(embed);
	},
};