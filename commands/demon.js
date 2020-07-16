const { YZEmbed } = require('../utils/embeds');
const Demon = require('../generators/FBLDemonGenerator');
const { RollParser } = require('../utils/RollParser');
const Util = require('../utils/Util');

module.exports = {
	name: 'demon',
	group: 'Forbidden Lands',
	description: 'Generates a random demon according to the tables found in'
		+ ' the *Forbidden Lands - Gamemaster\'s Guide*.'
		+ '\nNote: all bonuses from the demon\'s abilities are not computed into its stats/armor/skills.'
		+ '\nNote: the attacks output is not optimal on a small screen (smartphone).',
	aliases: ['generate-demon'],
	guildOnly: false,
	args: false,
	usage: '',
	async execute(args, ctx) {
		const demon = new Demon();

		const embed = new YZEmbed(
			`${demon.form.toUpperCase()} DEMON`,
			`${demon.icon}`,
		);

		// Demon's attributes & Armor Rating.
		embed.addField(
			'Attributes',
			`Strength: **${demon.attributes.str}**`
				+ `\nAgility: **${demon.attributes.agi}**`
				+ `\nWits: **${demon.attributes.wit}**`
				+ `\nEmpathy: **${demon.attributes.emp}**`,
			true,
		);

		embed.addField(
			'Body',
			`Armor Rating: **${demon.armor}**`
				+ ((demon.formEffect) ? `\n${demon.formEffect}` : ''),
			true,
		);

		// Demon's skills.
		let skillsText = '';

		for (const key in demon.skills) {
			if (demon.skills[key] > 0) skillsText += `\n${Util.strCamelToNorm(key)}: **${demon.skills[key]}**`;
		}

		if (!skillsText.length) skillsText = '*None*';

		embed.addField('Skills', skillsText, true);

		// Demon's attack(s).
		const intvlColLen = 7, nameColLen = 18, diceColLen = 6, dmgColLen = 8;
		let attacksText = '```\n'
			+ Util.alignText(demon.attacksRoll, intvlColLen, 0)
			+ Util.alignText('Name', nameColLen, 0)
			+ Util.alignText('Base', diceColLen, 0)
			+ Util.alignText('Damage', dmgColLen, 0)
			+ 'Range\n' + '-'.repeat(intvlColLen + nameColLen + diceColLen + dmgColLen + 6);

		for (const attack of demon.attacks) {
			attacksText += '\n'
				+ Util.alignText(`${attack.interval}`, intvlColLen, 0)
				+ Util.alignText(`${attack.name}`, nameColLen, 0)
				+ Util.alignText(`${attack.base}D`, diceColLen, 0)
				+ Util.alignText(`${attack.damage}`, dmgColLen, 0)
				+ `${attack.range}\n`;

			if (attack.special) attacksText += `     > ${attack.special}\n`;
		}

		attacksText += '\n```';

		embed.addField('Attacks', attacksText, false);

		// Demon's abilities & strengths.
		let abilitiesText = '';

		for (const ability of demon.abilities) {
			abilitiesText += `\n**${ability[0]}:** ${RollParser.supersede(ability[1])}`;
		}

		for (const strength of demon.strengths) {
			abilitiesText += `\n**${strength[0]}:** ${RollParser.supersede(strength[1])}`;
		}

		embed.addField('Abilities', abilitiesText, false);

		// Demon's weaknesses.
		let wkText = '';

		for (const weakness of demon.weaknesses) {
			wkText += `\n**${weakness[0]}:** ${weakness[1]}`;
		}

		embed.addField('Weaknesses', wkText, false);

		return ctx.channel.send(embed);
	},
};