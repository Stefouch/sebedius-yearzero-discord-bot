const { YZEmbed } = require('../utils/embeds');
const Planet = require('../generators/ALIENWorldGenerator');

module.exports = {
	name: 'colony',
	group: 'ALIEN rpg',
	description: 'Generates a colonized planet for the ALIEN rpg.',
	aliases: ['colo'],
	guildOnly: false,
	args: false,
	usage: '',
	async execute(args, ctx) {
		const o = new Planet('rocky', true, 1);
		const embed = new YZEmbed(o.title, o.description);

		if (!args[0]) {

			// COLONY SIZE & POPULATION
			const colo = o.colony;
			embed.addField(
				'Population',
				`:busts_in_silhouette: × ${colo.population}\n(${colo.size})`,
				true,
			);

			// COLONY MISSIONS
			const missions = colo.missions;
			embed.addField(
				`Mission${(missions.size > 1) ? 's' : ''}`,
				[...missions].join('\n'),
				true,
			);

			// COLONY ALLEGIANCE
			embed.addField('Allegiance', colo.allegiance, true);

			// COLONY ORBIT
			embed.addField('Orbit', o.orbits.join('\n'), true);

			// COLONY FACTIONS
			const factions = colo.factions;
			embed.addField(
				`Faction${(factions.qty > 1) ? 's' : ''}`,
				`${factions.strengths}:\n- ${factions.types.join('\n- ')}`,
				false,
			);

			// COLONY HOOK
			embed.addField('Event', colo.hook, false);
		}

		return ctx.channel.send(embed);
	},
};