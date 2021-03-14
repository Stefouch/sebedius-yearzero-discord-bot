const { getTable } = require('../Sebedius');
const { clamp, rand } = require('../utils/Util');
const { YZEmbed } = require('../utils/embeds');
const { DICE_ICONS } = require('../utils/constants');
const { __ } = require('../lang/locales');

module.exports = {
	name: 'panic',
	// aliases: ['alien-panic'],
	category: 'alien',
	description: 'cpanic-description',
	moreDescriptions: 'cpanic-moredescriptions',
	guildOnly: false,
	args: false,
	usage: '<stress> [-fixed|-f] [-nerves|-n] [-min <value>] [-lang language_code]',
	async run(args, ctx) {
		const argv = require('yargs-parser')(args, {
			boolean: ['fixed', 'nerves'],
			number: ['min'],
			string: ['lang'],
			alias: {
				fixed: ['f'],
				nerves: ['nerve', 'n'],
				lang: ['lng', 'language'],
			},
			default: {
				fixed: false,
				nerves: false,
				min: 0,
				lang: null,
			},
			configuration: ctx.bot.config.yargs,
		});
		const lang = await ctx.bot.getValidLanguageCode(argv.lang, ctx);
		
		const panicRand = argv.fixed ? 0 : Math.max(0, rand(1, 6));
		const stress = +argv._[0] || 0;
		const panicVal = stress + panicRand - (argv.nerves ? 2 : 0);
		const panicMin = clamp(argv.min, 0, 15);
		const panicLowerThanMin = panicVal < panicMin;
		const panicValMore = panicLowerThanMin ? panicMin + 1 : panicVal;
		const panicRoll = clamp(panicValMore, 0, 15);

		const panicTable = getTable('PANIC', './gamedata/crits/', 'crits-alien-panic', lang, 'csv');
		const panicAction = panicTable.get(panicRoll);
		if (!panicAction) return ctx.reply(`❌ ${__('cpanic-effect-not-found', lang)}.`);

		const text = `${panicAction.icon} ${__('panic-roll', lang).toUpperCase()}: **${stress}** + ${DICE_ICONS.alien.skill[panicRand]}`
			+ (argv.nerves ? ` − 2 *(${__('talent-alien-nerves-of-steel', lang)})*` : '')
			+ (panicMin ? ` ${panicLowerThanMin ? '<' : '≥'} ${panicMin}` : '');
		const embed = new YZEmbed(`${panicAction.injury} (${panicAction.ref})`, panicAction.effect, ctx, true);

		// Interrupted skill roll reminder.
		if (panicVal >= 10) {
			embed.addField(
				__('cpanic-interrupted-skill-roll-title', lang),
				__('cpanic-interrupted-skill-roll-text', lang),
			);
		}

		// Permanent Mental Trauma reminder.
		if (panicVal >= 13) {
			embed.addField(
				__('cpanic-mental-trauma-reminder-title', lang),
				__('cpanic-mental-trauma-reminder-text', lang),
			);
		}

		console.log(`:>> ${__('panic', lang)}! ${panicVal}`);

		return await ctx.send(text, embed);
	},
};