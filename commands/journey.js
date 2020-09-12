const { MessageEmbed } = require('discord.js');
const { getSelection } = require('../Sebedius');
const YZJourney = require('../yearzero/YZJourney');
const YZTerrainTypesFlags = require('../yearzero/YZTerrainTypesFlags');
const { YZEmbed } = require('../utils/embeds');
const { capitalize, trimString, strCamelToNorm } = require('../utils/Util');
const { SUPPORTED_LANGS } = require('../utils/constants');
const ReactionMenu = require('../utils/ReactionMenu');

const T_OPTS = Object.keys(YZTerrainTypesFlags.FLAGS)
	.join(', ')
	.replace('PLAINS', '__PLAINS__');

module.exports = {
	name: 'journey',
	aliases: ['jou'],
	category: 'fbl',
	description: 'Performs a Forbidden Lands Journey.',
	moreDescriptions: [
		[
			'Arguments',
			`• \`-create|-c\` – Creates a Journey (basic).
			• \`-mishap|-m [activity]\` – Draws a random Journey mishap.
			• \`-lang [language_code]\` – Sets the language.
			• \`[title]\` – Defines a title.`,
		],
		[
			'Arguments for the Creation',
			`• \`-quarter|-q|-qd <label>\` – Defines the current Quarter of Day.
			Available labels are: MORNING, __DAY__, EVENING, NIGHT.

			• \`-season|-s <label>\` – Defines the current season.
			Available labels are: __SPRING__, SUMMER, AUTUMN, WINTER.

			• \`-terrain|-t <label>\` – Defines the current terrain type.
			Available labels are: ${T_OPTS}.
			
			*Defaults are __underlined__.*`,
		],
		[
			'Mishap Activities',
			YZJourney.Activities
				.filter(a => a.mishap)
				.keyArray()
				.join(', ')
				.toLowerCase(),
		],
	],
	cooldown: 60,
	guildOnly: false,
	args: true,
	usage: '<create | mishap [activity]> [arguments...]',
	async run(args, ctx) {
		// Parses arguments.
		const argv = require('yargs-parser')(args, {
			array: ['name'],
			boolean: ['create', 'mishap'],
			string: ['lang', 'quarterDay', 'season', 'terrains'],
			alias: {
				create: ['c'],
				lang: ['lng', 'language'],
				mishap: ['m', 'mishaps'],
				name: ['n', 'title'],
				quarterDay: ['d', 'q', 'qd', 'quarter', 'quarterday'],
				season: ['s'],
				terrains: ['t', 'terrain'],
			},
			default: {
				create: false,
				mishap: false,
				lang: 'en',
			},
			configuration: ctx.bot.config.yargs,
		});

		// Used for the Mishap subcommand.
		let activityName;

		// Validates subcommands.
		if (argv._.length && (argv._[0].toLowerCase() === 'create' || argv._[0].toLowerCase() === 'c')) {
			argv._.shift();
			argv.create = true;
		}
		if (argv._.length && (argv._[0].toLowerCase() === 'mishap' || argv._[0].toLowerCase() === 'm')) {
			argv._.shift();
			argv.mishap = true;
		}
		if (argv.mishap) {
			const activities = YZJourney.Activities
				.filter(a => a.mishap)
				.keyArray();
			activityName = await select(ctx, argv._.length ? argv._.shift() : '', activities);
		}

		// Exits early if no subcommand was specified.
		if (!argv.create && !argv.mishap) {
			return ctx.reply('ℹ️ Please choose a subcommand `create` or `mishap`.');
		}

		const title = argv.name ? trimString(argv.name.join(' '), 100) : '';
		const lang = Object.keys(SUPPORTED_LANGS).includes(argv.lang) ? argv.lang : 'en';
		const fileName = `./gamedata/fbl/fbl-journeys.${lang}.yml`;

		// YZJourney options' placeholder.
		const createOptions = {
			quarterDay: null,
			season: null,
			terrains: null,
		};

		// Builds the options for the YZJourney.
		if (argv.create) {
			for (const opt in createOptions) {
				// Gets the keys list from the constant related to the option.
				let stack = {};
				if (opt === 'quarterDay') stack = YZJourney.QUARTER_DAYS;
				else if (opt === 'season') stack = YZJourney.SEASONS;
				else if (opt === 'terrains') stack = YZTerrainTypesFlags.FLAGS;
				else throw new ReferenceError('Dumb Stefouch!');
				const haystack = Object.keys(stack);

				// Triggers a message selector if the argument was called.
				if (argv[opt] != undefined) {
					createOptions[opt] = await select(
						ctx, argv[opt],
						haystack,
					);
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
				title: `JOURNEY${title ? ` — "${title}"` : ''}`,
				description: getDescription(jou),
				fields: [
					{
						name: 'Terrain',
						value: getTerrainDescription(jou),
						inline: false,
					},
					{
						name: 'Activities',
						value: getReactionsDescription(jou),
						inline: true,
					},
					{
						name: 'Characteristics',
						value: `Quarter Day: **${capitalize(jou.quarterDay)}**`
							+ `\nSeason: **${capitalize(jou.season)}**`
							+ `\n${jou.dayIcon} *${jou.inDaylight ? 'in daylight' : 'in darkness'}*`,
						inline: true,
					},
					{
						name: 'Modifiers',
						value: getModifiersDescription(jou),
						inline: true,
					},
				],
			});
			// Sends the Embed Message.
			const embedMessage = await ctx.send(embed);

			// Adds a reaction menu.
			// Clicking 📌 will add all the Activities icons.
			const rm = new ReactionMenu(embedMessage, 30000, [
				{
					icon: '📌',
					owner: ctx.author.id,
					fn: async collector => {
						collector.stop();
						setTimeout(() => addActivitiesReactions(embedMessage), 1000);
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
					.map(a => [capitalize(a.tag.toLowerCase()), a]);

				activity = await getSelection(ctx, mishaps);
			}
			else {
				activity = YZJourney.Activities.get(activityName);
			}

			if (!activity) {
				throw new ReferenceError(`Journey - Mishap table NOT FOUND\nActivity: ${activityName}`);
			}

			const mishap = jou.data[activity.mishap].random();

			const embed = new YZEmbed(
				`${jou.data[activity.mishap].name} Mishap${title ? ` — "${title}"` : ''}`,
				undefined,
				ctx, true,
			);
			embed.addField(`**\`${mishap[0].toUpperCase()}\`**`, mishap[1]);

			return await ctx.send(embed);
		}
	},
};

/**
 * Launches a message selector for user input.
 * @param {string} needle Word that pre-filters the list of choices
 * @param {string[]} haystack List of choices
 * @returns {string}
 */
async function select(ctx, needle, haystack) {
	needle = needle.toLowerCase();
	let matchings = haystack.filter(x => x.toLowerCase() === needle);
	if (!matchings.length) {
		matchings = haystack.filter(x => x.toLowerCase().includes(needle));
	}
	if (!matchings.length) {
		matchings = haystack;
	}
	matchings = matchings.map(x => [capitalize(x.toLowerCase().replace(/_/g, ' ')), x]);
	return await getSelection(ctx, matchings);
}

/**
 * Adds all Activities icons as reaction emojis under the message.
 * @param {Discord.Message} message Message to react
 */
async function addActivitiesReactions(message) {
	for (const [, acti] of YZJourney.Activities) {
		if (acti.icon) {
			await message.react(acti.icon);
		}
	}
}

/**
 * Journey's generic description.
 * @returns {string}
 */
function getDescription() {
	return 'List of available actions:\n`'
		+ YZJourney.Activities
			.array()
			.map(a => strCamelToNorm(a.tag).toUpperCase())
			.join('`, `')
		+ '`';
}

/**
 * Terrain's description.
 * @param {YZJourney} jou
 * @returns {string}
 */
function getTerrainDescription(jou) {
	const lands = jou.terrain
		.toArray()
		.map(t => capitalize(t.toLowerCase().replace(/_/g, ' ')));

	return '`' + lands.join('`, `') + '`\n'
		+ '*(' + capitalize(jou.terrain.modifiers.movement.toLowerCase()) + ')*';
}

/**
 * Modifiers' description.
 * @param {YZJourney} jou
 * @returns {string}
 */
function getModifiersDescription(jou) {
	return (jou.inDarkness ? `${jou._('leadingTheWayMishaps')}: **-2**\n` : '')
		+ `${jou._('foragingMishaps')}: **${jou.forageModifier > 0 ? '+' : ''}${jou.forageModifier}**\n`
		+ `${jou._('huntingMishaps')}: **${jou.huntModifier > 0 ? '+' : ''}${jou.huntModifier}**`;
}
/**
 * Reactions' description.
 * @param {YZJourney} jou
 * @returns {string}
 */
function getReactionsDescription(jou) {
	return YZJourney.Activities
		.map(acti => `${acti.icon} ${jou._(acti.mishap ? acti.mishap : acti.tag)}`)
		.join('\n');
}