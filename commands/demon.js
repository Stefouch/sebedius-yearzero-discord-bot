const Demon = require('../generators/FBLDemonGenerator');
const { YZEmbed } = require('../utils/embeds');
const { __ } = require('../utils/locales');
const { alignText, strCamelToNorm, getValidLanguageCode } = require('../utils/Util');
const { substitute } = require('../yearzero/YZRoll');

module.exports = {
	name: 'demon',
	aliases: ['generate-demon'],
	category: 'fbl',
	description: 'cdemon-description',
	guildOnly: false,
	args: false,
	usage: '[-lang language_code]',
	async run(args, ctx) {
		const argv = require('yargs-parser')(args, {
			string: ['lang'],
			alias: {
				lang: ['lng', 'language']
			},
			default: {
				lang: null
			},
			configuration: ctx.bot.config.yargs,
		});
		const lang = await getValidLanguageCode(argv.lang, ctx);

		const demon = new Demon(lang);

		const embed = new YZEmbed(
			`${demon.form.toUpperCase()} ${__('demon', lang).toUpperCase()}`,
			`${demon.icon}`,
		);

		// Demon's attributes & Armor Rating.
		embed.addField(
			__('attributes', lang),
			`${__('attribute-fbl-strength', lang)} **${demon.attributes.str}**`
				+ `\n${__('attribute-fbl-agility', lang)} **${demon.attributes.agi}**`
				+ `\n${__('attribute-fbl-wits', lang)} **${demon.attributes.wit}**`
				+ `\n${__('attribute-fbl-empathy', lang)} **${demon.attributes.emp}**`,
			true,
		);

		embed.addField(
			__('body', lang),
			`${__('armor-rating', lang)} **${demon.armor}**`
				+ ((demon.formEffect) ? `\n${demon.formEffect}` : ''),
			true,
		);

		// Demon's skills.
		let skillsText = '';

		for (const key in demon.skills) {
			if (demon.skills[key] > 0) skillsText += `\n${__('skill-fbl-' + key, lang)} **${demon.skills[key]}**`;
		}

		if (!skillsText.length) skillsText = `*${__('none', lang)}*`;

		embed.addField(__('skills', lang), skillsText, true);

		// Demon's attack(s).
		const intvlColLen = 7, nameColLen = 18, diceColLen = 6, dmgColLen = 8;
		let attacksText = '```\n'
			+ alignText(demon.attacksRoll, intvlColLen, 0)
			+ alignText(__('name', lang), nameColLen, 0)
			+ alignText(__('base', lang), diceColLen, 0)
			+ alignText(__('damage', lang), dmgColLen, 0)
			+ __('range', lang) + '\n' + '-'.repeat(intvlColLen + nameColLen + diceColLen + dmgColLen + 6);

		for (const attack of demon.attacks) {
			attacksText += '\n'
				+ alignText(`${attack.interval}`, intvlColLen, 0)
				+ alignText(`${attack.name}`, nameColLen, 0)
				+ alignText(`${attack.base}D`, diceColLen, 0)
				+ alignText(`${attack.damage}`, dmgColLen, 0)
				+ `${attack.range}\n`;

			if (attack.special) attacksText += `     > ${attack.special}\n`;
		}

		attacksText += '\n```';

		embed.addField(__('attacks', lang), attacksText, false);

		// Demon's abilities & strengths.
		let abilitiesText = '';

		for (const ability of demon.abilities) {
			abilitiesText += `\n**${ability[0]}:** ${substitute(ability[1])}`;
		}

		for (const strength of demon.strengths) {
			abilitiesText += `\n**${strength[0]}:** ${substitute(strength[1])}`;
		}

		embed.addField(__('abilities', lang), abilitiesText, false);

		// Demon's weaknesses.
		let wkText = '';

		for (const weakness of demon.weaknesses) {
			wkText += `\n**${weakness[0]}:** ${weakness[1]}`;
		}

		embed.addField(__('weaknesses', lang), wkText, false);

		return await ctx.send(embed);
	},
};