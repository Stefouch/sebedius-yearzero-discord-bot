const Artos = require('../gamedata/myz/artifacts.list.json');
const { YZEmbed } = require('../utils/embeds');
const { random } = require('../utils/Util');

module.exports = {
	name: 'artifact',
	aliases: ['arto'],
	category: 'myz',
	description: 'Draws a random artifact from the MYZ core rulebook. Available sources are (combine one or more):'
		+ '\n• `myz` – Mutant: Year Zero (default if none are specified)'
		+ '\n• `gla` – Mutant: GenLab Alpha'
		+ '\n• `mek` – Mutant: Mechatron'
		+ '\n• `ely` – Mutant: Elysium'
		+ '\n• `astra` – Mutant: Ad Astra'
		+ '\nMetaplot items are removed by default. Use `meta` to add them to the stack.'
		+ '\nUse `all` to pick from all book sources (including metaplot items).',
	guildOnly: false,
	args: false,
	usage: '[all | myz meta gla mek ely astra]',
	async run(args, ctx) {
		// Lists all legal books
		const legalBooks = new Array();
		for (const book in Artos) legalBooks.push(book);

		// If "all", adds all books.
		if (args.includes('all')) args = args.concat(legalBooks);
		// Default book should be MYZ.
		if (!args[0]) args.push('myz');

		// Using a "Set" object instead of a simple Array,
		// because it avoids duplicates.
		const artifacts = new Set();

		// Adds artifacts
		args.forEach(arg => {
			arg = arg.toLowerCase();
			if (legalBooks.includes(arg)) {
				Artos[arg].forEach(arto => artifacts.add(arto));
			}
		});

		const artifact = random(artifacts);
		const embed = new YZEmbed('Artifact', artifact);

		if (!artifact) {
			return await ctx.reply('I\'m sorry, no artifact where found with this unknown package!');
		}
		return await ctx.send(embed);
	},
};