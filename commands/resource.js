const { YZEmbed } = require('../utils/embeds');
const YZRoll = require('../yearzero/YZRoll');
const { emojifyRoll } = require('../Sebedius');
const { __ } = require('../lang/locales');

const ARTIFACT_DIE_REGEX = /^d(6|8|10|12)$/i;

module.exports = {
	name: 'resource',
	aliases: ['res', 'ressource', 'resources', 'ressources'],
	category: 'fbl',
	description: 'cresource-description',
	guildOnly: false,
	args: true,
	usage: '<d6|d8|d10|d12> [name] [-lang language_code]',
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

		const resourceDieArgument = argv._.shift();

		if (ARTIFACT_DIE_REGEX.test(resourceDieArgument)) {
			const [, size] = resourceDieArgument.match(ARTIFACT_DIE_REGEX);
			const resTitle = argv._.length ? argv._.join(' ') : __('resource', lang);
			const roll = new YZRoll('fbl', ctx.author, resTitle, lang)
				.addDice('arto', 1, size);
			sendMessageForResourceDie(roll, ctx);
		}
		else {
			ctx.reply(`⚠️ ${__('cresource-invalid-dice', lang)}.`);
		}
	},
};

/**
 * Sends a Message for the corresponding Resource Die
 * @param {YZRoll} roll The Resource Die roll
 * @param {*} ctx The Message's context
 */
function sendMessageForResourceDie(roll, ctx) {
	if (roll.size > ctx.bot.config.commands.roll.max) return ctx.reply(__('cresource-too-many-dice', roll.lang));

	const die = roll.dice[0];
	const desc = `**\`D${die.range}\`** ${__('resource-die', roll.lang)}: **${die.result}**`;
	const embed = new YZEmbed(roll.name, desc, ctx, true);
	const text = emojifyRoll(roll, ctx.bot.config.commands.roll.options[roll.game]);

	if (die.result <= 2) {
		const resSizes = [0, 6, 8, 10, 12];
		const newSize = resSizes[resSizes.indexOf(die.range) - 1];

		if (newSize > 0) {
			embed.addField(
				`⬇ ${__('cresource-decreased-title', roll.lang)}`,
				`${__('cresource-decreased-text', roll.lang)} **\`D${newSize}\`**.`,
			);
		}
		else {
			embed.addField(
				`🚫 ${__('cresource-exhausted-title', roll.lang)}`,
				__('cresource-exhausted-text', roll.lang),
			);
		}
	}
	else {
		embed.addField(
			`✅ ${__('cresource-unchanged-title', roll.lang)}`,
			__('cresource-unchanged-text', roll.lang),
		);
	}
	ctx.send(text, embed);
}