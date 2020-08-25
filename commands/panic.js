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
			• \`-nerves|-n\` – Applies the *Nerves of Steel* talent (−2 to the Panic roll).
			• \`-min <value>\` – Adjusts a minimum treshold for multiple consecutive panic effects.`,
		],
	],
	// aliases: ['alien-panic'],
	guildOnly: false,
	args: false,
	usage: '<stress> [-fixed|-f] [-nerves|-n] [-min <value>]',
	async execute(args, ctx) {
		const argv = require('yargs-parser')(args, {
			boolean: ['fixed', 'nerves'],
			number: ['min'],
			alias: {
				fixed: ['f'],
				nerves: ['nerve', 'n'],
			},
			default: {
				fixed: false,
				nerves: false,
				min: 0,
			},
			configuration: ctx.bot.config.yargs,
		});
		const panicRand = argv.fixed ? 0 : Math.max(0, Util.rand(1, 6) - (argv.nerves ? 2 : 0));
		const stress = +argv._[0] || 0;
		const panicVal = stress + panicRand;
		const panicMin = Util.clamp(argv.min, 0, 15);
		const panicLowerThanMin = panicVal < panicMin;
		const panicValMore = panicLowerThanMin ? panicMin + 1 : panicVal;
		const panicRoll = Util.clamp(panicValMore, 0, 15);

		const panicTable = Sebedius.getTable('PANIC', './gamedata/crits/', 'crits-alien-panic', 'en', 'csv');
		const panicAction = panicTable.get(panicRoll);
		if (!panicAction) return ctx.reply('❌ The panic effect wasn\'t found.');

		const text = `${panicAction.icon} PANIC ROLL: **${stress}** + ${DICE_ICONS.alien.skill[panicRand]}`
			+ (argv.nerves ? ' (−2 *Nerves of Steel*)' : '')
			+ (panicMin ? ` ${panicLowerThanMin ? '<' : '≥'} ${panicMin}` : '');
		const embed = new YZEmbed(`${panicAction.injury} (${panicAction.ref})`, panicAction.effect, ctx, true);

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