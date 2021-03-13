const { MessageEmbed } = require('discord.js');
const YZZoneSector = require('../yearzero/YZZoneSector');
const { YZMonster } = require('../yearzero/YZObject');
const { capitalize, trimString } = require('../utils/Util');

module.exports = {
	name: 'zonesector',
	aliases: ['sector'],
	category: 'myz',
	description: 'Creates a random Zone sector.',
	moreDescriptions: [
		[
			'Arguments',
			'• `-rot|-rotlevel <0-3>` – Sets the Rot Level between 0 and 3.'
			+ '\n• `-threats|-t <0-5>` – Sets or modifies (if prefixing with ±) the number of Threats to draw between 0 (none) and 5.'
			+ '\n• `-threatlevel|-lvl <0-10>` – Sets or modifies (if ±) the Threat Level between 0 (none) and 10.'
			+ '\n• `-night|-dark` – Adds +3 to the Threat Level.'
			+ '\n• `-ruin|-r` – Forces the placement of a large ruin.'
			+ '\n• `-lang|-language|-lng <language_code>` – Uses a different language. See `setconf` command for available options.'
			+ '\n• `-hide|-private|-h` – Hides most information behind several spoiler tags.',
		],
	],
	guildOnly: false,
	args: false,
	usage: '[arguments...]',
	async run(args, ctx) {
		// Parses arguments.
		const argv = require('yargs-parser')(args, {
			boolean: ['hide', 'night', 'ruin'],
			number: ['rot'],
			string: ['lang', 'threats', 'threatlevel'],
			alias: {
				hide: ['h', 'private'],
				lang: ['lng', 'language'],
				night: ['dark'],
				rot: ['rotlevel', 'rot-level'],
				ruin: ['r', 'ruins'],
				threats: ['t', 'threat'],
				threatlevel: ['lvl', 'threat-level'],
			},
			default: {
				hide: false,
				lang: null,
				night: false,
				rot: undefined,
				ruin: false,
				threats: undefined,
				threatlevel: undefined,
			},
			configuration: ctx.bot.config.yargs,
		});
		const title = argv._.length ? trimString(argv._.join(' '), 100) : '';
		const lang = await ctx.bot.getValidLanguageCode(argv.lang, ctx);
		const fileName = `./gamedata/myz/myz-zonesectors.${lang}.yml`;
		const h = () => argv.hide ? '||' : '';

		// Creates the Zone Sector.
		const zs = new YZZoneSector(fileName, {
			rotLevel: argv.rot,
			threatLevel: argv.threatlevel,
			threatQty: argv.threats,
			atNight: argv.night ? true : false,
			withRuins: argv.ruin ? true : false,
		});

		// Creates the Embed Message.
		const embed = new MessageEmbed({
			color: ctx.bot.config.color,
			title: `${zs.environment.name.toUpperCase()} ${title ? ` — "${title}"` : '(Zone Sector)'}`,
			description: `${zs.data.rotLevel.name}: ${h()}**${zs.rotLevel}** — *${zs.rotType}*${h()}`
				+ `\nThreat Level: ${h()}**${zs.threatLevel}** — *${zs.threatRoll.toValues()}*${h()}`,
		});

		if (zs.hasRuin) {
			embed.addField(`**\`${zs.ruin.name.toUpperCase()}\`**`, zs.ruin.description);
		}

		if (zs.mood) {
			// Extracts the theme and the point of interest.
			const theme = zs.mood.split(' ', 1)[0].trim().slice(1, -1);
			const poi = zs.mood.slice(theme.length + 3).split('.', 1)[0].trim();

			// Adds the field to the embed.
			embed.addField(
				'Mood',
				`${h()}\`${theme}\` **${poi}** — *${zs.mood.slice(theme.length + poi.length + 5)}*${h()}`,
			);
		}

		if (zs.hasFinds) {
			embed.addField(
				'Finds',
				'- ' + Object.entries(zs.finds)
					.filter(f => f[1] > 0)
					.map(f => `${h()}${capitalize(f[0])}: **${f[1]}**${h()}`)
					.join('\n- '),
				true,
			);
		}

		if (zs.threats.size) {
			const thrs = [];
			for (const t of zs.threats) {
				if (t.value instanceof YZMonster) {
					thrs.push(`${h()}${t.icon} __${t.value.name}__${h()}`);
				}
				else {
					thrs.push(`${h()}${t.icon} __${t.value}__${h()}`);
				}
			}
			embed.addField('Threats', `${thrs.join('\n')}`, true);
		}

		// Sends the message.
		return await ctx.send(embed);
	},
};