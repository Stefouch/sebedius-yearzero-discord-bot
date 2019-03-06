const DemonCommand = require('./demon');
const YZEmbed = require('../util/YZEmbed');
const Monster = require('../util/YZMonsterGenerator');
const Util = require('../util/Util');

module.exports = {
	name: 'monster',
	description: 'Generates a random monster according to the tables found in'
		+ '*Zone Compendium 1: The Lair of the Saurians*'
		+ '\n The argument `demon` instead generates a random demon according to'
		+ ' the tables found in the roleplaying game *Forbidden Lands*.',
	aliases: ['generate-monster'],
	guildOnly: false,
	args: false,
	usage: '[demon]',
	execute(args, message) {
		// Exits early and executes !demon if argument "Demon".
		if (args.includes('demon')) return DemonCommand.execute(['demon'], message);

		const monster = new Monster();

		const embed = new YZEmbed(
			`${monster.name.toUpperCase()}${monster.swarm ? 'S' : ` ⨯ ${monster.qty}`}`,
			(monster.loner ? '' : `${monster.descriptions.number} of `)
				+ ` *${monster.descriptions.traits.join(' and ')}* `
				+ `${monster.descriptions.size} ${monster.descriptions.type}${monster.loner ? '' : 's'}`
		);

		// Creature's Strength, Agility, Armor Rating & Legs.
		embed.addField(
			'Attributes',
			`Strength: **${monster.str + +monster.swarm * 3}**\nAgility: **${monster.agi}**`,
			true
		);
		embed.addField(
			'Body',
			`Armor Rating: **${monster.armor}**\n${monster.descriptions.limbs}`,
			true
		);

		// Creature's skill(s).
		let skillsText = '';
		if (monster.skills) {
			for (const skill in monster.skills) {
				skillsText += `\n${Util.strCamelToNorm(skill)}: **${monster.skills[skill]}**`;
			}
		}
		else {
			skillsText += '*None*';
		}
		embed.addField('Skills', skillsText, true);

		// Creature's attack(s).
		const nameColLen = 15, dmgColLen = 10, rangeColLen = 9;
		let attacksText = '```'
			+ `\nName${' '.repeat(nameColLen - 4)}`
			+ `Damage${' '.repeat(dmgColLen - 6)}`
			+ `Range${' '.repeat(rangeColLen - 5)}`
			+ 'Special';

		for (const attack of monster.attacks) {
			attacksText += `\n${attack.name}${' '.repeat(Math.max(nameColLen - attack.name.length, 0))}`
				+ `${attack.damage}${' '.repeat(Math.max(dmgColLen - attack.damage.toString().length, 0))}`
				+ `${attack.range}${' '.repeat(Math.max(rangeColLen - attack.range.length, 0))}`
				+ (attack.special ? attack.special : '–');
		}
		attacksText += '\n```';

		embed.addField('Attacks', attacksText, false);

		// Creature's mutation(s).
		embed.addField(
			'Mutations',
			(monster.mutations) ? monster.mutations.join(', ') : '*None*',
			false
		);

		// Swarm's special.
		if (monster.swarm) {
			embed.addField('Special', 'Swarm *(Can only be damaged by flamethrowers and mutations)*', false);
		}

		// console.log(monster);
		return message.channel.send(embed);
	},
};