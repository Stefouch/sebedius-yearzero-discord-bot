const Util = require('../utils/Util');
const YZEmbed = require('../utils/embeds');
const { DICE_ICONS } = require('../utils/constants');

module.exports = {
	name: 'panic',
	group: 'ALIEN rpg',
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

		const text = `😱 PANIC ROLL: **${stress}** + ${DICE_ICONS.alien.skill[panicRand]}`;
		const embed = getEmbedPanicRoll(panicVal, message, client);

		// Interrupted skill roll reminder.
		if (panicVal >= 10) {
			embed.addField(
				'Interrupted Skill Roll',
				'You will be forced to perform a specific action. If the Panic Roll was the result of a skill check for an action, the action is cancelled and immediately replaced by the forced panic action, even if you succeeded your roll.',
			);
		}

		// Permanent Mental Trauma reminder.
		if (panicVal >= 13) {
			embed.addField(
				'End of Game Session: Roll for Permanent Mental Trauma',
				'You must make an **EMPATHY** roll after the session. Roll for the attribute only, not using any skill. If the roll *succeeds*, you develop a permanent mental trauma of some kind. Roll a D6 and consult the table on page 161.',
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
function getEmbedPanicRoll(panic, message, client) {
	const panicTable = client.getTable('./gamedata/crits', 'crits-alien-panic', 'en', 'csv');
	const panicRoll = Util.clamp(panic, 0, 15);
	const criticalInjury = panicTable.get(panicRoll);

	// Exits early if no critical injury was found.
	if (!criticalInjury) return message.reply('❌ The critical injury wasn\'t found.');

	return new YZEmbed(`**${criticalInjury.injury}**`, criticalInjury.effect, message, true);
}