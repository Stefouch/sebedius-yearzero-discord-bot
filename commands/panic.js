const Crits = require('../data/crits.json');
const YZEmbed = require('../util/YZEmbed');
const Util = require('../util/Util');

module.exports = {
	name: 'panic',
	description: 'Rolls for a random panic effect for the *ALIEN* roleplaying game. You must indicate your starting stress level.',
	moreDescriptions: [
		[
			'Arguments',
			'• `-f` | `--fixed` – Uses a fixed number (doesn\'t add a D6).',
		],
	],
	// aliases: ['alien-panic'],
	guildOnly: false,
	args: true,
	usage: '<stress> [--fixed]',
	async execute(args, message, client) {
		const fixed = /-f|-fix/i.test(args[1]);

		const panicRand = fixed ? 0 : Util.rand(1, 6);
		const stress = +args[0] || 0;
		const panicVal = stress + panicRand;

		const text = `😱 PANIC ROLL: **${stress}** + ${client.config.icons.alien.skill[panicRand]}`;
		const embed = getEmbedPanicRoll(panicVal, message);

		// Interrupted skill roll reminder.
		if (panicVal >= 10) {
			embed.addField(
				'Interrupted Skill Roll',
				'You will be forced to perform a specific action. If the Panic Roll was the result of a skill check for an action, the action is cancelled and immediately replaced by the forced panic action, even if you succeeded your roll.'
			);
		}

		// Permanent Mental Trauma reminder.
		if (panicVal >= 13) {
			embed.addField(
				'End of Game Session: Roll for Permanent Mental Trauma',
				'You must make an **EMPATHY** roll after the session. Roll for the attribute only, not using any skill. If the roll *succeeds*, you develop a permanent mental trauma of some kind. Roll a D6 and consult the table on page 161, or hit `!crit m`.'
			);
		}

		return message.channel.send(text, embed);
	},
};

/**
 * Gets an Embed with the result of a Panic Roll (ALIEN-rpg).
 * @param {number} panic The value of the Panic Roll
 * @param {Discord.Message} message The triggering message
 * @returns {Discord.RichEmbed} A Discord Embed Object
 */
function getEmbedPanicRoll(panic, message) {
	const panicTable = Crits.alien.panic;
	const panicRoll = Util.clamp(panic, 0, 15);
	let criticalInjury;

	// Iterates each critical injury from the defined table.
	for (const crit of panicTable) {

		// If the critical injury reference is one value, it's a number.
		if (typeof crit.ref === 'number') {

			if (crit.ref === panicRoll) {
				criticalInjury = crit;
				break;
			}
		}
		// If the critical injury reference is a range, it's an array with length 2.
		else if (crit.ref instanceof Array) {

			if (crit.ref.length >= 2) {

				// crit.ref[0]: minimum
				// crit.ref[1]: maximum
				if (panicRoll >= crit.ref[0] && panicRoll <= crit.ref[1]) {
					criticalInjury = crit;
					break;
				}
			}
		}
		else {
			console.error('[ERROR] - [CRIT] - crit.ref type is not supported.', crit);
		}
	}

	// Exits early if no critical injury was found.
	if (!criticalInjury) return message.reply('The critical injury wasn\'t found.');

	return new YZEmbed(`**${criticalInjury.injury}**`, criticalInjury.effect, message, true);
}