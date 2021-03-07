const { YZEmbed } = require('../utils/embeds');
const Planet = require('../generators/ALIENWorldGenerator');
const { __ } = require('../utils/locales');

module.exports = {
	name: 'colony',
	aliases: ['colo'],
	category: 'alien',
	description: 'ccolony-description',
	moreDescriptions: 'ccolony-moredescriptions',
	guildOnly: false,
	args: false,
	usage: '[name] [-type planet-type] [-location core|arm] [-lang language_code]',
	async run(args, ctx) {
		// Parses arguments.
		const argv = require('yargs-parser')(args, {
			boolean: ['uncolonized'],	// Is only called by the "planet" command
			string: ['lang', 'type', 'location'],
			alias: {
				type: ['t', 'planettype', 'planet-type'],
				uncolonized: ['uc', 'uncol'],
				location: ['l', 'loc'],
				lang: ['lng', 'language'],
			},
			default: {
				type: 'rocky',
				uncolonized: false,
				location: 'arm',
				lang: null,
			},
			configuration: ctx.bot.config.yargs,
		});
		const lang = await ctx.bot.getValidLanguageCode(argv.lang, ctx);
		const location = argv.location && argv.location.includes('core') ? 0 : 1;
		const colonyName = argv._.join(' ');
		const type = ['rocky', 'icy', 'gasgiant', 'gasgiant-moon', 'asteroid-belt'].includes(argv.type) ? argv.type : 'rocky';

		const planet = new Planet(type, !argv.uncolonized, location, colonyName, lang);
		const embed = new YZEmbed(planet.title, planet.description);

		if (!argv.uncolonized) {

			// COLONY SIZE & POPULATION
			const colo = planet.colony;
			embed.addField(
				__('population', lang),
				`:busts_in_silhouette: × ${colo.population}\n(${colo.size})`,
				true,
			);

			// COLONY MISSIONS
			const missions = colo.missions;
			embed.addField(
				__(missions.size > 1 ? 'alien-missions' : 'alien-mission', lang),
				[...missions].join('\n'),
				true,
			);

			// COLONY ALLEGIANCE
			embed.addField(__('allegiance', lang), colo.allegiance, true);

			// COLONY ORBIT
			embed.addField(__('orbit', lang), planet.orbits.join('\n'), true);

			// COLONY FACTIONS
			const factions = colo.factions;
			embed.addField(
				__(factions.qty > 1 ? 'factions' : 'faction', lang),
				`${factions.strengths}:\n- ${factions.types.join('\n- ')}`,
				false,
			);

			// COLONY HOOK
			embed.addField(__('alien-event', lang), colo.hook, false);
		}

		return ctx.send(embed);
	},
};