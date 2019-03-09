const YZEmbed = require('../util/YZEmbed');
const Demon = require('../util/FBLDemonGenerator');
const Util = require('../util/Util');

module.exports = {
	name: 'demon',
	description: 'Generates a random demon according to the tables found in'
		+ ' the roleplaying game *Forbidden Lands*',
	aliases: ['generate-demon'],
	guildOnly: false,
	args: false,
	execute(args, message) {
		const demon = new Demon();

		const embed = new YZEmbed(
			`${demon.form.toUpperCase()} DEMON`,
			`${demon.icon}`
		);

		// Demon's attributes & Armor Rating.
		embed.addField(
			'Attributes',
			`Strength: **${demon.attributes.str}**`
				+ `\nAgility: **${demon.attributes.agi}**`
				+ `\nWits: **${demon.attributes.wit}**`
				+ `\nEmpathy: **${demon.attributes.emp}**`,
			true
		);

		embed.addField(
			'Body',
			`Armor Rating: **${demon.armor}**`
				+ ((demon.formEffect) ? `\n${demon.formEffect}` : ''),
			true
		);

		// Demon's skills.
		let skillsText = '';

		for (const key in demon.skills) {
			if (demon.skills[key] > 0) skillsText += `\n${Util.strCamelToNorm(key)}: **${demon.skills[key]}**`;
		}

		if (!skillsText.length) skillsText = '*None*';

		embed.addField('Skills', skillsText, true);

		// Demon's attack(s).
		const nameColLen = 18, diceColLen = 8, dmgColLen = 10;
		let attacksText = '```'
			+ `\n Name${' '.repeat(nameColLen - 3)}`
			+ `Base${' '.repeat(diceColLen - 4)}`
			+ `Damage${' '.repeat(dmgColLen - 6)}`
			+ 'Range\n' + '-'.repeat(nameColLen + diceColLen + dmgColLen + 9);

		for (const attack of demon.attacks) {
			attacksText += `\n★${attack.name}${' '.repeat(Math.max(nameColLen - attack.name.length, 0) - 1)}`
				+ `${attack.base}D${' '.repeat(Math.max(diceColLen - attack.base.toString().length, 0) - 1)}`
				+ `${attack.damage}${' '.repeat(Math.max(dmgColLen - attack.damage.toString().length, 0))}`
				+ `${attack.range}\n`
				+ (attack.special ? ` Special: ${attack.special}\n` : '');
		}

		attacksText += '\n```';

		embed.addField('Attacks', attacksText, false);

		// Demon's abilities & strengths.
		let abilitiesText = '';

		for (const ability of demon.abilities) {
			abilitiesText += `\n**${ability[0]}:** ${ability[1]}.`;
		}

		for (const strength of demon.strengths) {
			abilitiesText += `\n**${strength[0]}:** ${strength[1]}`;
		}

		embed.addField('Abilities', abilitiesText, false);

		// Demon's weaknesses.
		let wkText = '';

		for (const weakness of demon.weaknesses) {
			wkText += `\n**${weakness[0]}:** ${weakness[1]}`;
		}

		embed.addField('Weaknesses', wkText, false);

		return message.channel.send(embed);
	},
};