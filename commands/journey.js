const { MessageEmbed } = require('discord.js');
const { getSelection } = require('../Sebedius');
const YZJourney = require('../yearzero/YZJourney');
const YZTerrainTypesFlags = require('../yearzero/YZTerrainTypesFlags');
const { YZEmbed } = require('../utils/embeds');
const { capitalize, trimString } = require('../utils/Util');
const { SUPPORTED_LANGS } = require('../utils/constants');

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
	guildOnly: false,
	args: true,
	usage: '<create | mishap [activity]> [-lang <language_code>] [title]',
	async run(args, ctx) {
		/**
		 * Activity TAG. (UpperCase)
		 * @type {string}
		 */
		let activityName;

		// Parses arguments.
		const argv = require('yargs-parser')(args, {
			boolean: ['create', 'mishap'],
			string: ['lang', 'quarter', 'season', 'terrain'],
			alias: {
				create: ['c'],
				lang: ['lng', 'language'],
				mishap: ['m', 'mishaps'],
				quarter: ['q', 'd', 'qd', 'quarterday'],
				season: ['s'],
				terrain: ['t', 'terrains'],
			},
			default: {
				create: false,
				mishap: false,
				lang: 'en',
			},
			configuration: ctx.bot.config.yargs,
		});
		// Validates arguments.
		if (argv._.length && (argv._[0].toLowerCase() === 'create' || argv._[0].toLowerCase() === 'c')) {
			argv._.shift();
			argv.create = true;
		}
		if (argv._.length && (argv._[0].toLowerCase() === 'mishap' || argv._[0].toLowerCase() === 'm')) {
			argv._.shift();
			argv.mishap = true;
		}
		if (argv.mishap && argv._.length) {
			const activities = YZJourney.Activities
				.filter(a => a.mishap)
				.keyArray();
			if (activities.includes(argv._[0].toUpperCase())) {
				activityName = argv._.shift().toUpperCase();
			}
		}
		const title = argv._.length ? trimString(argv._.join(' '), 100) : '';
		const lang = Object.keys(SUPPORTED_LANGS).includes(argv.lang) ? argv.lang : 'en';
		const fileName = `./gamedata/fbl/fbl-journeys.${lang}.yml`;
		const terrain = Object.keys(YZTerrainTypesFlags.FLAGS).includes(argv.terrain) ? argv.terrain : null;

		// Creates the Journey.
		const jou = new YZJourney(fileName, {
			quarterDay: argv.quarter,
			season: argv.season,
			terrains: terrain,
		});

		if (argv.create) {
			const embed = new MessageEmbed({
				color: ctx.bot.config.color,
				title: `JOURNEY${title ? ` — "${title}"` : ''}`,
				description: jou.getDescription(),
				fields: [
					{
						name: 'Terrrain',
						value: jou.getTerrainDescription(),
						inline: false,
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
						value: jou.getModifiersDescriptions(),
						inline: true,
					},
				],
			});
			return await ctx.send(embed);
		}
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