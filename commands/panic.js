const Sebedius = require('../Sebedius');
const Util = require('../utils/Util');
const { YZEmbed } = require('../utils/embeds');
const { DICE_ICONS } = require('../utils/constants');

module.exports = {
	name: 'panic',
	group: 'ALIEN rpg',
	description: 'Rolls for a random panic effect for the *ALIEN* roleplaying game. You must indicate your starting stress level.',
	moreDescriptions: [
		[
			'Arguments',
			`• \`-fixed|-f\` – Uses a fixed number instead (doesn't add a D6).
			• \`-nerves|-n\` – Applies the *Nerves of Steel* talent (−2 to the Panic roll).`,
		],
	],
	// aliases: ['alien-panic'],
	guildOnly: false,
	args: true,
	usage: '<stress> [-fixed|-f] [-nerves|-n]',
	async execute(args, ctx) {
		const argv = require('yargs-parser')(args, {
			boolean: ['fixed', 'nerves'],
			alias: {
				fixed: ['f'],
				nerves: ['nerve', 'n'],
			},
			default: {
				fixed: false,
				nerves: false,
			},
			configuration: ctx.bot.config.yargs,
		});
		const panicRand = argv.fixed ? 0 : Math.max(0, Util.rand(1, 6) - (argv.nerves ? 2 : 0));
		const stress = +argv._[0] || 0;
		const panicVal = stress + panicRand;

		const panicIcon = ctx.bot.config.commands.panic.icon;
		const text = `${panicIcon} PANIC ROLL: **${stress}** + ${DICE_ICONS.alien.skill[panicRand]}`
			+ (argv.nerves ? ' (−2 *Nerves of Steel*)' : '');
		const embed = getEmbedPanicRoll(panicVal, ctx);

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

		return await ctx.channel.send(text, embed);
	},
};

/**
 * Gets an Embed with the result of a Panic Roll (ALIEN-rpg).
 * @param {number} panic The value of the Panic Roll
 * @param {Discord.Message} message The triggering message with context
 * @returns {Discord.RichEmbed} A Discord Embed Object
 */
function getEmbedPanicRoll(panic, ctx) {
	const panicTable = Sebedius.getTable('CRIT', './gamedata/crits/', 'crits-alien-panic', 'en', 'csv');
	const panicRoll = Util.clamp(panic, 0, 15);
	const criticalInjury = panicTable.get(panicRoll);

	// Exits early if no critical injury was found.
	if (!criticalInjury) return ctx.reply('❌ The critical injury wasn\'t found.');

	return new YZEmbed(`**${criticalInjury.injury}**`, criticalInjury.effect, ctx, true);
}