const { random, getValidLanguageCode } = require('../utils/Util');
const { YZEmbed } = require('../utils/embeds');
const { __ } = require('../utils/locales');

module.exports = {
	name: 'drawmutation',
	aliases: ['drawmut'],
	category: 'myz',
	description: 'cdrawmutation-description',
	guildOnly: false,
	args: false,
	usage: '[all | myz gla zc2 zc5 psi] [-lang language_code]',
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
		const lang = await getValidLanguageCode(argv.lang, ctx);
		let usedBooks = argv._;

		const Muts = require(`../gamedata/myz/mutations.list.${lang}.json`);

		// Lists all legal books
		const legalBooks = new Array();
		for (const book in Muts) legalBooks.push(book);

		// If "all", adds all books.
		if (usedBooks.includes('all')) usedBooks = usedBooks.concat(legalBooks);
		// Default book should be MYZ.
		if (!usedBooks.includes('myz') && !usedBooks.includes('psi')) usedBooks.push('myz');

		// Using a "Set" object instead of a simple Array,
		// because it avoids duplicates.
		const mutations = new Set();

		// Adds mutations
		usedBooks.forEach(book => {
			book = book.toLowerCase();
			if (legalBooks.includes(book)) {
				Muts[book].forEach(mut => mutations.add(mut));
			}
		});

		const mutation = random(mutations);
		const embed = new YZEmbed(__('mutation', lang), mutation);

		await ctx.send(embed);

		return mutation;
	},
};