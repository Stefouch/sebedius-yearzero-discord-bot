const YZEmbed = require('../util/YZEmbed');
const Job = require('../util/ALIENJobGenerator');

module.exports = {
	name: 'job',
	description: 'Generates a random job for the ALIEN rpg.',
	// aliases: ['aquest'],
	guildOnly: false,
	args: true,
	usage: 'job <cargo|mil|expe>',
	async execute(args, message, client) {

		if (!args[0]) return message.reply('Please specify job type');

		let type = '';

		if (/^(cargo|cargorun|cargo run)$/i.test(args[0])) type = 'cargo';
		else if (/^(mil|military|militarymission|military mission)$/i.test(args[0])) type = 'mil';
		else if (/^(expe|exped|expedition)$/i.test(args[0])) type = 'expe';

		const j = new Job(type);
		const embed = new YZEmbed(j.title, j.description);

		if (!args[0]) {

			// COLONY SIZE & POPULATION
			/*
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
			embed.addField('Event', colo.hook, false);//*/
		}

		return message.channel.send(embed);
	},
};