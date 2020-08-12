const Artos = require('../gamedata/artifacts.list.json');
const { YZEmbed } = require('../utils/embeds');
const { random } = require('../utils/Util');

module.exports = {
	name: 'artifact',
	group: 'Mutant: Year Zero',
	description: 'Draws a random artifact from the MYZ core rulebook. Available sources are:'
		+ '\n• `myz` – Mutant: Year Zero (default)'
		+ '\n• `gla` – Mutant: GenLab Alpha'
		+ '\n• `mech` – Mutant: Mechatron'
		+ '\n• `ely` – Mutant: Elysium'
		+ '\n• `astra` – Mutant: Ad Astra'
		+ '\nMetaplot items are removed by default. Use `meta` to add them to the roll.'
		+ '\nUse `all` to pick from all book sources (including metaplot items).',
	aliases: ['arto'],
	guildOnly: false,
	args: false,
	usage: '[all | myz meta gla mech ely astra]',
	async execute(args, ctx) {
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
		return await ctx.channel.send(embed);
	},
};