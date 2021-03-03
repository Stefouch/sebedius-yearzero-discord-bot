const { YZEmbed } = require('../utils/embeds');
const { random } = require('../utils/Util');
const { __ } = require('../utils/locales');

module.exports = {
	name: 'artifact',
	aliases: ['arto'],
	category: 'myz',
	description: 'cartifact-description',
	guildOnly: false,
	args: false,
	usage: '[all | myz meta gla mek ely astra] [-lang language_code]',
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
		const lang = await ctx.bot.getValidLanguageCode(argv.lang, ctx);
		let usedBooks = argv._;

		const Artos = require(`../gamedata/myz/artifacts.list.${lang}.json`);

		// Lists all legal books
		const legalBooks = new Array();
		for (const book in Artos) legalBooks.push(book);

		// If "all", adds all books.
		if (usedBooks.includes('all')) usedBooks = usedBooks.concat(legalBooks);
		// Default book should be MYZ.
		if (!usedBooks[0]) usedBooks.push('myz');

		// Using a "Set" object instead of a simple Array,
		// because it avoids duplicates.
		const artifacts = new Set();

		// Adds artifacts
		usedBooks.forEach(book => {
			book = book.toLowerCase();
			if (legalBooks.includes(book)) {
				Artos[book].forEach(arto => artifacts.add(arto));
			}
		});

		const artifact = random(artifacts);
		const embed = new YZEmbed(__('artifact', lang), artifact);

		if (!artifact) {
			return await ctx.reply(__('cartifact-not-found', lang));
		}
		return await ctx.send(embed);
	},
};