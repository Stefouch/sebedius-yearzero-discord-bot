const YZEmbed = require('../utils/YZEmbed');
const Monster = require('../generators/MYZMonsterGenerator');
const Util = require('../utils/Util');

module.exports = {
	name: 'monster',
	group: 'Mutant: Year Zero',
	description: 'Generates a random monster according to the tables found in'
		+ ' the *Zone Compendium 1: The Lair of the Saurians*.'
		+ '\nThe argument `demon` instead generates a random demon according to'
		+ ' the tables found in the roleplaying game *Forbidden Lands*.',
	aliases: ['generate-monster', 'creature'],
	guildOnly: false,
	args: false,
	usage: '[demon]',
	async execute(args, message, client) {
		// ( !demon SHORTCUT )
		// Exits early and executes !demon if argument "Demon".
		if (args.includes('demon')) return client.commands.get('demon').execute(args, message, client);

		const monster = new Monster();

		const embed = new YZEmbed(
			`${monster.name.toUpperCase()}${monster.swarm ? 'S' : ` ⨯ ${monster.qty}`}`,
			(monster.loner ? '' : `${monster.descriptions.number} of `)
				+ `*${monster.descriptions.traits.join(' and ')}* `
				+ `${monster.descriptions.size} ${monster.descriptions.type}${monster.loner ? '' : 's'}`,
		);

		// Creature's Strength, Agility, Armor Rating & Legs.
		embed.addField(
			'Attributes',
			`Strength: **${monster.str + +monster.swarm * 3}**\nAgility: **${monster.agi}**`,
			true,
		);

		embed.addField(
			'Body',
			`Armor Rating: **${monster.armor}**\n${monster.descriptions.limbs}`,
			true,
		);

		// Creature's skill(s).
		let skillsText = '';

		if (monster.skills) {
			for (const skName in monster.skills) {

				if (skName === 'fight') { if (!monster.melee) continue; }
				if (skName === 'shoot') { if (!monster.ranged) continue; }

				skillsText += `\n${Util.strCamelToNorm(skName)}: **${monster.skills[skName]}**`;
			}
		}
		else {
			skillsText += '*None*';
		}

		embed.addField('Skills', skillsText, true);

		// Creature's attack(s).
		const nameColLen = 16, dmgColLen = 10, rangeColLen = 9;
		let attacksText = '```'
			+ Util.alignText('\nName', nameColLen, 0)
			+ Util.alignText('Damage', dmgColLen, 0)
			+ Util.alignText('Range', rangeColLen, 0)
			+ 'Special';

		for (const attack of monster.attacks) {
			attacksText += Util.alignText(`\n${attack.name}`, nameColLen, 0)
				+ Util.alignText(`${attack.damage}`, dmgColLen, 0)
				+ Util.alignText(`${attack.range}`, rangeColLen, 0)
				+ (attack.special ? attack.special : '–');
		}

		attacksText += '\n```';

		embed.addField('Attacks', attacksText, false);

		// Creature's mutation(s).
		embed.addField(
			'Mutations',
			(monster.mutations) ? monster.mutations.join(', ') : '*None*',
			false,
		);

		// Swarm's special.
		if (monster.swarm) {
			embed.addField('Special', 'Swarm *(Can only be damaged by flamethrowers and mutations)*', false);
		}

		// console.log(monster);
		return message.channel.send(embed);
	},
};