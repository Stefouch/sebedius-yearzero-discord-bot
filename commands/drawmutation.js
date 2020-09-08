const Muts = require('../gamedata/myz/mutations.list.json');
const { random } = require('../utils/Util');
const { YZEmbed } = require('../utils/embeds');

module.exports = {
	name: 'drawmutation',
	aliases: ['drawmut'],
	category: 'myz',
	description: 'Draws a random mutation from the MYZ core rulebook. Available sources are:'
		+ '\n• `gla` – Adds *Mutant: GenLab Alpha* mutations'
		+ '\n• `zc2` – Adds *Zone Compendium 2: Dead Blue Sea* mutations'
		+ '\n• `zc5` – Adds *Zone Compendium 5: Hotel Imperator* mutations'
		+ '\n• `psi` – Draws only from Psionic/mental mutations'
		+ '\nUse `all` to pick from all book sources.',
	guildOnly: false,
	args: false,
	usage: '[all | gla zc2 zc5 psi]',
	async run(args, ctx) {
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

		await ctx.channel.send(embed);

		return mutation;
	},
};