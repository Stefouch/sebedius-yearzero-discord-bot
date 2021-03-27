const { emojifyRoll } = require('../Sebedius');
const { isNumber, clamp } = require('../utils/Util');
const { YZEmbed } = require('../utils/embeds');
const YZRoll = require('../yearzero/YZRoll');
const { __ } = require('../lang/locales');
const { KEEP_CAPITALIZATION_LANGS } = require('../utils/constants');

module.exports = {
	name: 'supply',
	aliases: ['sup'],
	category: 'alien',
	description: 'Rolls for a supply.',
	guildOnly: false,
	args: true,
	usage: '<rating> [name] [-lang <language_code>]',
	async run(args, ctx) {
		// Parses arguments.
		const argv = require('yargs-parser')(args, {
			string: ['lang'],
			alias: {
				lang: ['lng', 'language'],
			},
			default: {
				lang: null,
			},
			configuration: ctx.bot.config.yargs,
		});
		const lang = await ctx.bot.getValidLanguageCode(argv.lang, ctx);

		let rating;
		// Accepts "8" and "8d", but not "d8".
		if (/^\d{1,2}d$/i.test(argv._[0])) rating = argv._.shift().match(/\d+/)[0];
		else rating = argv._.length > 0 ? +argv._.shift() : null;

		if (isNumber(rating)) {
			// A maximum of 6 dice are rolled. See ALIEN corebook pg. 34 for details.
			const resQty = clamp(rating, 0, 6);
			const resTitle = argv._.length ? argv._.join(' ') : __('alien-supply', lang);
			const roll = new YZRoll('alien', ctx.author, resTitle, lang)
				.addStressDice(resQty);
			sendMessageForResourceRoll(rating, roll, ctx);
		}
		else {
			ctx.reply(`ℹ️ ${__('csupply-invalid-roll')} \`${ctx.prefix}${module.exports.usage}\``);
		}
	},
};

/**
 * Sends a message for the passed roll
 * @param {number} resRating 
 * @param {YZRoll} roll 
 * @param {*} ctx 
 */
function sendMessageForResourceRoll(resRating, roll, ctx) {
	// const resRating = roll.stress;
	const newRating = resRating - roll.panic;

	const gameOptions = ctx.bot.config.commands.roll.options[roll.game];

	const text = emojifyRoll(roll, gameOptions);
	const embed = new YZEmbed(`**${roll.name.toUpperCase()}** (${resRating})`, null, ctx, true);

	if (resRating === newRating) {
		embed.addField(
			`✅ ${__('csupply-unchanged-title', roll.lang)}`,
			`${__('csupply-unchanged-text', roll.lang)} **${newRating}**`,
		);
	}
	else if (newRating > 0) {
		embed.addField(
			`⬇ ${__('csupply-decreased-title', roll.lang)}`,
			`${__('csupply-decreased-by', roll.lang)} ${roll.panic}`
				+ ` ${KEEP_CAPITALIZATION_LANGS.includes(roll.lang) ? __(roll.panic > 1 ? 'steps' : 'step', roll.lang) : __(roll.panic > 1 ? 'steps' : 'step', roll.lang).toLowerCase()}.`
				+ `\n${ __('csupply-decreased-rating', roll.lang)
	} ** ${ newRating }**`,
		);
	}
	else {
		embed.addField(
			`🚫 ${__('csupply-exhausted-title', roll.lang)}`,
			`${__('csupply-exhausted-text', roll.lang)} **0**`,
		);
	}
	ctx.send(text, embed);
}