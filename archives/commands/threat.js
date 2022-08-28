const { YZEmbed } = require('../utils/embeds');
const { rand, rollD66, capitalize } = require('../utils/Util');
const { __ } = require('../lang/locales');

module.exports = {
	name: 'threat',
	aliases: ['thr'],
	category: 'myz',
	description: 'cthreat-description',
	guildOnly: false,
	args: false,
	usage: '[-lang <language_code>]',
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
		const Threats = require(`../gamedata/myz/threats.list.${lang}.json`);

		// Rolls for the threat type.
		const nb = rand(1, 6);
		let type;

		if (nb <= 2) type = 'humanoids';
		else if (nb <= 5) type = 'monsters';
		else type = 'phenomenons';

		// Collects the list of the threats for the chosen type.
		const threats = Threats.myz[type];

		// Rolls for the threat from the chosen type.
		const rnd = rollD66();
		let threat;

		for (let i = rnd; i > 10; i--) {
			if (`${i}` in threats && rnd >= i) {
				threat = threats[`${i}`];
				break;
			}
		}

		const typeStr = __(`myz-${type.slice(0, -1)}`, lang);
		const embed = new YZEmbed(__('cthreat-myz-title', lang), `${typeStr} – ${threat}`);

		return ctx.send(embed);
	},
};