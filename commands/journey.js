const { MessageEmbed } = require('discord.js');
const { getSelection } = require('../Sebedius');
const YZJourney = require('../yearzero/YZJourney');
const YZTerrainTypesFlags = require('../yearzero/YZTerrainTypesFlags');
const { YZEmbed } = require('../utils/embeds');
const { trimString } = require('../utils/Util');
const ReactionMenu = require('../utils/ReactionMenu');
const { __ } = require('../lang/locales');

const T_OPTS = Object.keys(YZTerrainTypesFlags.FLAGS)
	.join(', ')
	.replace('PLAINS', '__PLAINS__');

module.exports = {
	name: 'journey',
	aliases: ['jou'],
	category: 'fbl',
	description: 'cjourney-description',
	moreDescriptions: 'cjourney-moredescriptions',
	cooldown: 60,
	guildOnly: false,
	args: true,
	usage: '<create | mishap [activity]> [arguments...] [-lang <language_code>]',
	/**
	 * @param {string[]} args Command's arguments
	 * @param {import('../utils/ContextMessage')} ctx Discord message with context
	 */
	async run(args, ctx) {
		// Parses arguments.
		const argv = require('yargs-parser')(args, {
			array: ['name'],
			boolean: ['create', 'mishap', 'fbr'],
			string: ['lang', 'quarterDay', 'season', 'terrains'],
			alias: {
				create: ['c'],
				lang: ['lng', 'language'],
				mishap: ['m', 'mishaps'],
				name: ['n', 'title'],
				quarterDay: ['d', 'q', 'qd', 'quarter', 'quarterday'],
				season: ['s'],
				terrains: ['t', 'terrain'],
				fbr: ['bitterreach', 'snow', 'ice'],
			},
			default: {
				create: false,
				mishap: false,
				lang: null,
				fbr: false,
			},
			configuration: ctx.bot.config.yargs,
		});

		const lang = await ctx.bot.getValidLanguageCode(argv.lang, ctx);
		const fileName = argv.fbr
			? `./gamedata/fbl/fbr-journeys.${lang}.yml`
			: `./gamedata/fbl/fbl-journeys.${lang}.yml`;

		// Used for the Mishap subcommand.
		let activityName;

		// Validates subcommands.
		if (argv._.length === 1 && argv._[0].toLowerCase() === 'help') {
			return await ctx.bot.commands.get('help').run(['journey'], ctx);
		}
		if (!argv.create && argv._.length && (argv._[0].toLowerCase() === 'create' || argv._[0].toLowerCase() === 'c')) {
			argv._.shift();
			argv.create = true;
		}
		if (!argv.mishap && argv._.length && (argv._[0].toLowerCase() === 'mishap' || argv._[0].toLowerCase() === 'm')) {
			argv._.shift();
			argv.mishap = true;
		}
/*	Removed because similar code was down below. That code was modified to also understand translated activities.
 		if (argv.mishap) {
			const activities = YZJourney.Activities
				.filter(a => a.mishap)
				.keyArray();
			activityName = await select(ctx, argv._.length ? argv._.shift() : '', activities, __('cjourney-activity-mishap-mismatch', lang));
		}
 */
		// Exits early if no subcommand was specified.
		if (!argv.create && !argv.mishap) {
			return ctx.reply('ℹ️ ' + __('cjourney-choose-subcommand', lang));
		}

		const title = argv.name ? trimString(argv.name.join(' '), 100) : '';

		// YZJourney options' placeholder.
		const createOptions = {
			quarterDay: null,
			season: null,
			terrains: null,
			fbr: argv.fbr,
			lang: lang,
		};

		// Builds the options for the YZJourney.
		if (argv.create) {
			for (const opt in createOptions) {
				// Gets the keys list from the constant related to the option.
				let stack = {}, localPrefix = '';
				if (opt === 'quarterDay') stack = YZJourney.QUARTER_DAYS;
				else if (opt === 'season') stack = YZJourney.SEASONS;
				else if (opt === 'terrains') 
				{
					stack = YZTerrainTypesFlags.FLAGS;
					localPrefix = 'terrain-'
				}
				else if (opt === 'fbr' || opt === 'lang') continue;
				else throw new ReferenceError('Dumb Stefouch!');
				const haystack = Object.keys(stack);

				// Triggers a message selector if the argument was called.
				if (argv[opt] != undefined) {
					const selectedOpt = await select(ctx, argv[opt], haystack, __('cjourney-choose-' + opt.toLowerCase(), lang), lang, localPrefix);
					if (selectedOpt) createOptions[opt] = selectedOpt.toUpperCase();
				}
				// Otherwise, checks each unused argument from `argv`
				// if a word matches one of the constant's keys.
				else {
					for (const [i, arg] of argv._.entries()) {
						if (haystack.includes(arg.toUpperCase())) {
							// If found, sets the option with it.
							createOptions[opt] = arg.toUpperCase();
							// And removes it from the unused arguments list.
							argv._.splice(i, 1);
							// Then stops the loop for this YZJourney option.
							break;
						}
					}
				}
			}

		}

		// Creates the Journey.
		const jou = new YZJourney(fileName, createOptions);

		// * CREATE
		if (argv.create) {
			const embed = new MessageEmbed({
				color: ctx.bot.config.color,
				title: `${__('journey', lang).toUpperCase()}${title ? ` — "${title}"` : ''}`,
				description: getDescription(jou, lang),
				footer: { text: `${__('game', lang)}: ${__(jou.fbr ? 'game-fbr' : 'game-fbl', lang)}` },
				fields: [
					{
						name: __('terrain', lang),
						value: getTerrainDescription(jou),
						inline: false,
					},
					{
						name: __('activities', lang),
						value: getActivitiesDescription(jou),
						inline: true,
					},
					{
						name: __('characteristics', lang),
						value: getCharacteristicsDescription(jou),
						inline: true,
					},
					{
						name: __('modifiers', lang),
						value: getModifiersDescription(jou),
						inline: true,
					},
				],
			});
			// Adds weather details, if any.
			if (jou.fbr) {
				embed.addField(__('weather', lang), getWeatherDescription(jou), false);
			}

			// Sends the Embed Message.
			const embedMessage = await ctx.send(embed);

			// Adds a reaction menu.
			// Clicking ▶️ will add all the Activities icons.
			const rm = new ReactionMenu(embedMessage, 45000, [
				{
					icon: '▶️',
					owner: ctx.author.id,
					fn: async collector => {
						collector.stop();
						setTimeout(() => addActivitiesReactions(embedMessage, jou), 1000);
					},

				},
			]);
		}

		// * MISHAP
		if (argv.mishap) {
			let activity;
			if (!activityName) {
				const mishaps = YZJourney.Activities
					.filter(a => a.mishap)
					.map(a => [jou.data[a.mishap].name, a]);

				activity = await select(ctx, argv._.length ? argv._.shift() : '', mishaps, __('cjourney-activity-mishap-mismatch', lang), lang);
			}
			else {
				activity = YZJourney.Activities.get(activityName);
			}

			if (!activity) {
				throw new ReferenceError(`Journey - Mishap table NOT FOUND\nActivity: ${activityName}`);
			}

			const mishap = jou.data[activity.mishap].random();

			const embed = new YZEmbed(
				`${jou.data[activity.mishap].name} ${__('mishap', lang)}${title ? ` — "${title}"` : ''}`,
				undefined,
				ctx, true,
			);
			embed.addField(`**\`${mishap[0].toUpperCase()}\`**`, mishap[1]);
			embed.setFooter(`${__('game', lang)}: ${__(jou.fbr ? 'game-fbr' : 'game-fbl', lang)}`);

			return await ctx.send(embed);
		}
	},
};

/**
 * Launches a message selector for user input.
 * @param {import('../utils/ContextMessage')} ctx Discord message with context
 * @param {string} [needle] Word that pre-filters the list of choices
 * @param {string[]} choices An array of strings or arrays with [name, object]
 * @param {?string} text Additional text to attach to the selection message
 * @param {string} lang The language code to use for translated selection embed entries
 * @param {string} localePrefix The prefix (in locale.js) for the values that should be translated
 * @returns {string}
 */
async function select(ctx, needle = '', choices, text, lang = 'en', localePrefix = '') {
	needle = needle.toLowerCase();
	let matchings = choices.filter(x => Array.isArray(x) ? x[0].toLowerCase() === needle || x[1].tag.toLowerCase() === needle : x.toLowerCase() === needle);	// exact match ("lead_the_way" === "lead_the_way")
	if (!matchings.length) {
		matchings = choices.filter(x => Array.isArray(x) ? x[0].toLowerCase().replace(/_/g, '') === needle.replace(/_/g, '') || x[1].tag.toLowerCase().replace(/_/g, '') === needle.replace(/_/g, '') : x.toLowerCase().replace(/_/g, '') === needle.replace(/_/g, ''));	// exact match without underscores ("leadtheway" === "leadtheway")
	}
	if (!matchings.length) {
		matchings = choices.filter(x => Array.isArray(x) ? x[0].toLowerCase().includes(needle) || x[1].tag.toLowerCase().includes(needle) : x.toLowerCase().includes(needle));	// needle is uncluded in key ("lead_the_way" includes "way")
	}
	if (!matchings.length) {
		matchings = choices;
	}
	if (!Array.isArray(matchings[0]))
	{
		matchings = matchings.map(x => [__(localePrefix + x.toLowerCase(), lang), x]);
	}
	return await getSelection(ctx, matchings, text);
}

/**
 * Adds all Activities icons as reaction emojis under the message.
 * @param {import('discord.js').Message} message Message to react
 * @param {YZJourney} jou
 */
async function addActivitiesReactions(message, jou) {
	for (const acti of YZJourney.Activities.array()) {
		if (acti.icon) {
			// Skips some reactions according to the settings.
			if (acti.tag === 'hike') continue;
			if (acti.tag === 'forage' && isNaN(jou.forageModifier)) continue;
			if (acti.tag === 'hunt' && isNaN(jou.huntModifier)) continue;
			if (acti.tag === 'seaTravel' && (jou.isImpassable || !jou.isWater)) continue;
			if (acti.tag === 'fish' && !jou.isWater) continue;
			// Adds the reaction.
			await message.react(acti.icon);
		}
	}
}

/**
 * Journey's generic description.
 * @param {YZJourney} journey
 * @returns {string}
 */
function getDescription(journey) {
	return __('cjourney-generic-description', journey.lang);
}

/**
 * Terrain's description.
 * @param {YZJourney} jou
 * @returns {string}
 */
function getTerrainDescription(jou) {
	const lands = jou.terrain
		.toArray()
		.map(t => __(`terrain-${t.toLowerCase().replace(/_/g, '-')}`, jou.lang));

	let str = '`' + lands.join('`, `') + '` — '
		+ __(`terrain-movement-${jou.terrain.modifiers.movement.toLowerCase().replace(/_/g, '-')}`, jou.lang);

	if (jou.terrain.modifiers.movement === 'OPEN') {
		str += `\n*${__('cjourney-movement-modifier-open', jou.lang)}*`;
	}
	else if (jou.terrain.modifiers.movement === 'DIFFICULT') {
		str += `\n*${__('cjourney-movement-modifier-difficult', jou.lang)}*`;
	}
	else if (jou.terrain.modifiers.movement.includes('BOAT')) {
		str += `\n*${__('cjourney-movement-modifier-boat', jou.lang)}*`;
	}

	return str;
}

/**
 * Characteristics' description.
 * @param {YZJourney} jou
 * @returns {string}
 */
function getCharacteristicsDescription(jou) {
	return `${__('quarter-day', jou.lang)}: **${__(jou.quarterDay.toLowerCase(), jou.lang)}**`
		+ `\n${__('season', jou.lang)}: **${__(jou.season.toLowerCase(), jou.lang)}**`
		+ `\n${jou.dayIcon} ${__(jou.inDaylight ? 'daylight' : 'darkness', jou.lang)}`
		+ (jou.isIcy ? `\n❄️ ${__('icy', jou.lang)}` : '');	
}

/**
 * Modifiers' description.
 * @param {YZJourney} jou
 * @returns {string}
 */
function getModifiersDescription(jou) {
	return (jou.leadTheWayModifier ? `${jou._('leadingTheWayMishaps')}: **${jou.leadTheWayModifier}**\n` : '')
		+ (jou.makeCampModifier ? `${jou._('makingCampMishaps')}: **${jou.makeCampModifier}**\n` : '')
		+ `${jou._('foragingMishaps')}: **${jou.forageModifier > 0 ? '+' : ''}${isNaN(jou.forageModifier) ? '—' : jou.forageModifier}**\n`
		+ `${jou._('huntingMishaps')}: **${jou.huntModifier > 0 ? '+' : ''}${isNaN(jou.huntModifier) ? '—' : jou.huntModifier}**`;
}
/**
 * Reactions' description.
 * @param {YZJourney} jou
 * @returns {string}
 */
function getActivitiesDescription(jou) {
	return YZJourney.Activities
		.map(acti => `${acti.icon} ${jou._(acti.mishap ? acti.mishap : acti.tag)}`)
		.join('\n');
}

/**
 * Weather's description.
 * @param {YZJourney} jou
 * @returns {string}
 */
function getWeatherDescription(jou) {
	if (!jou.fbr) return '—';
	let str = '';
	for (const [type, wd] of Object.entries(jou.weatherDetailed)) {
		str += `> **${__(type.toLowerCase(), jou.lang)}:** \`${wd.name}\`\n${wd.effect}\n\n`;
	}
	return str;
}