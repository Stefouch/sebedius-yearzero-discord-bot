const Config = require('../config.json');
const Crits = require('../sheets/crits.json');
const { rand, mod, rollD6 } = require('../utils/utils.js');
const { RichEmbed } = require('discord.js');

module.exports = {
	name: 'crit',
	description: 'Rolls for a random critical injury. You may specify a table or a numeric value. The default is the damage table. Other available tables are:\n• `nt` or `nontypical` : Critical injury for non-typical damage.\n• `p` or `pushed` : Critical injury for pushed damage (none).\n• `h` or `horror` : The *Forbidden Lands• Horror traumas, adapted for MYZ.',
	aliases: ['ci', 'injury'],
	guildOnly: false,
	args: false,
	usage: '[nt | p | h] [numeric]',
	execute(args, message) {
		let critTable, critRoll, criticalInjury;

		// Specified injuries.
		if (args.includes('nontypical') || args.includes('nt')) {
			critRoll = 0;
			criticalInjury = Crits.myz.nonTypical;
		}
		else if (args.includes('pushed') || args.includes('p')) {
			critRoll = 0;
			criticalInjury = Crits.myz.pushed;
		}
		// If not specified, gets a critical table.
		else {
			if (args.includes('horror') || args.includes('h')) critTable = Crits.fbl.horror;
			// Default table = myz-damage.
			else critTable = Crits.myz.damage;

			// Checks if we look for a specific value of that table.
			// regIndexOf returns -1 if not found.
			const specific = args.regIndexOf(/^[1-6][1-6]$/);
			if (specific >= 0) {
				// Creates the roll value out of the specified argument.
				critRoll = Number(args[specific]);
			}
			// Otherwise, gets a random injury.
			else {
				critRoll = rand(1, 6) * 10 + rand(1, 6);
			}

			// Iterates each critical injury from the defined table.
			for (const crit of critTable) {

				// If the critical injury reference is one value, it's a number.
				if (typeof crit.ref === 'number') {

					if (crit.ref === critRoll) criticalInjury = crit;
				}
				// If the critical injury reference is a range, it's an array with length 2.
				else if (Array.isArray(crit.ref)) {

					if (crit.ref.length >= 2) {

						// crit.ref[0]: minimum
						// crit.ref[1]: maximum
						if (critRoll >= crit.ref[0] && critRoll <= crit.ref[1]) {
							criticalInjury = crit;
						}
					}
				}
				else {
					console.error('[ERROR] - [CRIT] - crit.ref type is not supported.', crit);
				}
			}
		}

		// Exits early if no critical injury was found.
		if (!criticalInjury) return message.reply('The critical injury wasn\'t found.');

		// Builds and sends the message.
		const reply = `${message.author.toString()} rolled for a critical injury:`;

		message.channel.send(reply, { embed: getEmbedCrit(critRoll, criticalInjury, message) })
			.then(() => {
				if (!args.regIncludes(/^[1-6][1-6]$/)
					&& (criticalInjury.ref === 65 || criticalInjury.ref === 66)) {
					// Sends a coffin emoticon.
					setTimeout(() => {
						message.channel.send('⚰');
					}, rand(2, 6) * 1000);
				}
			})
			.catch(error => {
				console.error('[ERROR] - Cannot send the coffin emoji', error);
			});
	},
};

/**
 * Gets details for a critical injury.
 * @param {number} critRoll The roll obtained for the critical injury reference
 * @param {Object} crit Object containing all infos for the critical injury
 * @param {Discord.Message} message The triggering message
 * @returns {Discord.RichEmbed} Discord embed message
 */
function getEmbedCrit(critRoll, crit, message) {
	let die1 = 0, die2 = 0;
	if (critRoll) {
		die1 = Math.floor(critRoll / 10);
		die2 = mod(critRoll, 10);
	}
	const icon1 = Config.icons.myz.base[die1];
	const icon2 = Config.icons.myz.base[die2];
	const authorColor = (message.channel.type === 'text') ? message.member.colorRole.color : 0x1AA29B;

	const embed = new RichEmbed({
		color: authorColor,
		title: `${(critRoll >= 11 && critRoll <= 66) ? `${icon1}${icon2} ` : ''}**${crit.injury}**`,
		author: {
			name: message.author.username,
			icon_url: message.author.avatarURL,
		},
		description: crit.effect,
		fields: [],
		// timestamp: new Date(),
		// footer: { text: 'Critical Injury' },
	});

	if (crit.healingTime) {
		let title, text;

		// -1 means permanent.
		if (crit.healingTime === -1) {
			title = 'Permanent';
			text = 'These effects are permanent.';
		}
		else {
			title = 'Healing Time';
			text = `${rollD6(crit.healingTime)} days until end of effects.`;
		}
		// embed.fields.push({ name: title, value: text, inline: true });
		embed.addField(title, text, true);
	}

	if (crit.lethal) {
		let text = '';

		if (crit.timeLimit) {
			text = '⚠ This critical injury is **LETHAL** and must be HEALED';

			if (crit.healMalus) {
				text += ` (modified by **${crit.healMalus}**)`;
			}
			text += ` within the next **${rollD6(crit.timeLimit)} ${crit.timeLimitUnit}**`;
			text += ' or the character will die.';
		}
		else {
			text += '💀💀💀';
		}
		// embed.fields.push({ name: 'Lethality', value: text, inline: true });
		embed.addField('Lethality', text, true);
	}

	return embed;
}