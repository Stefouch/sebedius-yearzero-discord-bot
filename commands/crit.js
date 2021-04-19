const { getTable } = require('../Sebedius');
const { isNumber, rollD66, sumD6 } = require('../utils/Util');
const { YZEmbed } = require('../utils/embeds');
const { SUPPORTED_GAMES, DICE_ICONS, SOURCE_MAP } = require('../utils/constants');
const { __ } = require('../lang/locales');
const { getSelection } = require('../Sebedius');

const availableCritTables = {
	myz: { damage: true, horror: 'fbl', pushed: true, nontypical: true },
	fbl: { slash: true, blunt: true, stab: true, horror: true, pushed: 'myz', nontypical: 'myz' },
	alien: { damage: true, mental: true, synthetic: true, xeno: true },
	coriolis: { damage: true, nontypical: true },
	vaesen: { damage: true, mental: true },
};

const critTypeAliases = {
	nontypical: ['nt', 'atypical', 'at'],
	pushed: ['p'],
	damage: ['dmg'],
	slash: ['sl'],
	blunt: ['bl'],
	stab: ['st'],
	horror: ['h'],
	synthetic: ['s', 'synth'],
	xeno: ['x'],
	mental: ['m'],
};

module.exports = {
	name: 'crit',
	category: 'common',
	description: 'ccrit-description',
	moreDescriptions: 'ccrit-moredescriptions',
	aliases: ['crits', 'critic', 'critical'],
	guildOnly: false,
	args: false,
	usage: '[game] [table] [numeric|-lucky <rank>] [-private|-p] [-lang <language_code>]',
	async run(args, ctx) {
		// Parsing arguments.
		const argv = require('yargs-parser')(args, {
			boolean: ['private'],
			number: ['lucky'],
			string: ['lang'],
			alias: {
				lang: ['lng', 'language'],
				lucky: ['ly'],
				private: ['p'],
			},
			default: {
				lang: null,
				lucky: null,
				private: false,
			},
			configuration: ctx.bot.config.yargs,
		});

		const lang = await ctx.bot.getValidLanguageCode(argv.lang, ctx);
		const privacy = argv.private;

		// Exits early if too many arguments
		if (args.length > 7) return await ctx.reply('⚠️ ' + __('ccrit-too-many-arguments', lang));

		let game, type, fixedReference;
		for (const arg of argv._) {
			// Checks and sets any fixed reference.
			if (!fixedReference && isNumber(arg)) {
				fixedReference = +arg;
			}
			// Checks and sets the game.
			else if (!game && SUPPORTED_GAMES.includes(arg)) {
				game = arg;
			}
			// If it's neither, it should be the critic's type.
			else if (!type) {
				for (const key in critTypeAliases) {
					if (arg === key) {
						type = arg;
						console.log('   • arg=key', type);
						break;
					}
					else if (critTypeAliases[key].includes(arg)) {
						type = key;
						console.log('   • arg=alias', type);
						break;
					}
				}
			}
			else {
				console.warn(`   • Unknown argument: ${arg}`);
			}
		}
		// Defaults.
		if (!game) game = await ctx.bot.getGame(ctx, 'myz');
		if (!type) type = 'damage';

		// Aborts if the table doesn't exist.
		if (!availableCritTables.hasOwnProperty(game)) {
			return ctx.reply(
				`ℹ️ ${__('ccrit-no-table-for-game', lang).replace('{game}', game)}`,
			);
		}
		if (!availableCritTables[game].hasOwnProperty(type)) {
			return ctx.reply(
				`ℹ️ ${__('ccrit-table-not-found', lang).replace('{type}', type)} **${SOURCE_MAP[game]}**.`,
			);
		}

		// Table swap.
		if (typeof availableCritTables[game][type] === 'string') {
			game = availableCritTables[game][type];
		}

		// Gets the Critical Injuries table.
		const fileName = `crits-${game}-${type}`;
		const critsTable = getTable('CRIT', './gamedata/crits/', fileName, lang);

		// Aborts if the table couldn't be retrieved.
		if (!critsTable) return ctx.reply('❌ An error occured: `null critsTable`.');
		if (critsTable.size === 0) return ctx.reply('❌ An error occured: `critsTable size 0`.');

		// Rolls the Critical Injuries table.
		const luckyRoll = !fixedReference ? await rollLucky(argv.lucky, critsTable, ctx, lang) : {};
		const critRoll = fixedReference || luckyRoll.result || rollD66();
		const crit = critsTable.get(critRoll);

		// Exits early if no critical injury was found.
		if (!crit) return ctx.reply(`❌ ${__('ccrit-not-found', lang)}. *(${__('table', lang)}: ${fileName})*`);

		// Adds a "game" property to the crit.
		crit.game = game;

		// Add the manipulation of the lucky roll to the crit-object for later consumption
		crit.manipulation = luckyRoll.manipulation;

		// Gets the values of each D66's dice.
		let die1 = 0, die2 = 0;
		if (critRoll) {
			die1 = Math.floor(critRoll / 10);
			die2 = critRoll % 10;
		}
		// Gets the emojis references.
		const dieType = ctx.bot.config.commands.roll.options[game].hasBlankDice ? 'alien' : game;
		const icon1 = DICE_ICONS[dieType].skill[die1] || '';
		const icon2 = DICE_ICONS[dieType].skill[die2] || '';

		// Sends the message.
		if (privacy) {
			return await ctx.author.send(icon1 + icon2, getEmbedCrit(crit, fileName, ctx, lang));
		}
		return await ctx.send(icon1 + icon2, getEmbedCrit(crit, fileName, ctx, lang))
			.then(() => {
				if (crit.fatal && game !== 'vaesen') {
					// Sends a coffin emoticon.
					setTimeout(() => {
						ctx.send('🪦');
					}, rollD66() * 150);
				}
			})
			.catch(error => {
				console.error('[ERROR] - [CRIT] - Cannot send the coffin emoji', error);
			});
	},
};

/**
 * Gets the details for a critical injury.
 * @param {Object} crit Object containing all infos for the critical injury
 * @param {string} name The name of the critical table
 * @param {Discord.Message} ctx The triggering message with context
 * @param {string} lang The language code to be used
 * @returns {YZEmbed} A rich embed
 */
function getEmbedCrit(crit, name, ctx, lang) {
	const embed = new YZEmbed(`**${crit.injury}**`, crit.effect, ctx, true);

	if (crit.healingTime) {
		let title, text;

		// -1 means permanent effect.
		if (crit.healingTime === -1) {
			title = __('permanent', lang);
			text = __('permanent-effects', lang);
		}
		else {
			title = __('healing-time', lang);
			text = `${sumD6(crit.healingTime)} ` + __('healing-time-until-end-text', lang);
		}
		embed.addField(title, text, false);
	}

	if (crit.lethal) {
		let text = '';

		if (crit.timeLimit || crit.game === 'vaesen') {
			text = '⚠ ' + __('ccrit-lethality-start', lang);

			if (crit.healMalus) {
				text += __('ccrit-lethality-healmalus', lang) + ` **${crit.healMalus}**)`;
			}

			if (/s$/.test(crit.timeLimitUnit) || /(ge|en)$/.test(crit.timeLimitUnit)) {
				text += __('ccrit-lethality-timelimit-multiple', lang)
					+ ` **${sumD6(crit.timeLimit)} ${crit.timeLimitUnit}**`;
			}
			else {
				text += __('ccrit-lethality-timelimit-single', lang) + ` ${crit.timeLimitUnit}**`;
			}
			text += __('ccrit-lethality-end', lang);
		}
		else {
			text += '💀💀💀';
		}
		embed.addField(__('lethality', lang), text, false);
	}

	if (crit.manipulation) {
		embed.addField(
			__('talent-fbl-lucky', lang),
			`${__('ccrit-lucky-text', lang)} \`${crit.manipulation.join(', ')}\``,
		);
	}

	embed.setFooter(__('table', lang) + `: ${name}`);

	return embed;
}

/**
 * A lucky roll.
 * @typedef LuckyRoll
 * @type {Object}
 * @property {number} result The end result of the lucky roll
 * @property {number[]} manipulation The manipulation to get to the end result
 */


/**
 * Uses the 'Lucky'-talent with it's corresponding rank.
 * @param {number} rank The rank of the talent (1-3)
 * @param {RollTable} critsTable The crits table to use for rank 3
 * @param {Discord.Message} ctx The context message
 * @param {string} lang The language code to be used
 * @returns {LuckyRoll} The final critical injury
 */
async function rollLucky(rank, critsTable, ctx, lang) {
	if (!isNumber(rank)) return;
	if (rank < 1) rank = 1;

	/**
	 * @type {LuckyRoll}
	 */
	const luckyRoll = {};

	// Rank 3: Choose whichever you want
	if (rank === 3) {
		const choices = [];
		critsTable.forEach(crit => {
			choices.push([crit.injury, crit.ref.substr(0, 2)]);
		});
		luckyRoll.result = await getSelection(ctx, choices, { text: __('ccrit-lucky-choose', lang), lang });
		return luckyRoll;
	}

	const values = [rollD66()];
	// Rank 1: roll twice, take the lowest
	if (rank >= 1) {
		values.push(rollD66());
	}
	// Rank 2: Roll twice, reverse the values, then take the lowest
	if (rank >= 2) {
		let reversed;
		for (let i = 0; i < 2; i++) {
			reversed = parseInt(values[i].toString().split('').reverse().join(''));
			values.push(reversed);
		}
	}

	// Return result and manipulation
	luckyRoll.result = Math.min(...values);
	luckyRoll.manipulation = values;
	return luckyRoll;
}
