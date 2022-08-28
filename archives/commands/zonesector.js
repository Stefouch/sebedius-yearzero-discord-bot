const { MessageEmbed } = require('discord.js');
const YZZoneSector = require('../yearzero/YZZoneSector');
const { YZMonster } = require('../yearzero/YZObject');
const { trimString } = require('../utils/Util');
const { __ } = require('../lang/locales');

module.exports = {
	name: 'zonesector',
	aliases: ['sector', 'zs'],
	category: 'myz',
	description: 'czonesector-description',
	moreDescriptions: 'czonesector-moredescriptions',
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
		const spoiler = argv.hide ? '||' : '';

		// Creates the Zone Sector.
		const zs = new YZZoneSector(fileName, {
			rotLevel: argv.rot,
			threatLevel: argv.threatlevel,
			threatQty: argv.threats,
			atNight: argv.night ? true : false,
			withRuins: argv.ruin ? true : false,
			lang: lang,
		});

		// Creates the Embed Message.
		const embed = new MessageEmbed({
			color: ctx.bot.config.color,
			title: `${zs.environment.name.toUpperCase()} ${title ? ` — "${title}"` : `(${__('myz-zone-sector', lang)})`}`,
			description: `${zs.data.rotLevel.name}: ${spoiler}**${zs.rotLevel}** — *${zs.rotType}*${spoiler}`
				+ `\n${__('myz-threat-level', lang)}: ${spoiler}**${zs.threatLevel}** — *${zs.threatRoll.toValues()}*${spoiler}`,
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
				__('myz-mood', lang),
				`${spoiler}\`${theme}\` **${poi}** — *${zs.mood.slice(theme.length + poi.length + 5)}*${spoiler}`,
			);
		}

		if (zs.hasFinds) {
			embed.addField(
				__('finds', lang),
				'- ' + Object.entries(zs.finds)
					.filter(f => f[1] > 0)
					.map(f => `${spoiler}${__(f[0], lang)}: **${f[1]}**${spoiler}`)
					.join('\n- '),
				true,
			);
		}

		if (zs.threats.size) {
			const thrs = [];
			for (const t of zs.threats) {
				if (t.value instanceof YZMonster) {
					thrs.push(`${spoiler}${t.icon} __${t.value.name}__${spoiler}`);
				}
				else {
					thrs.push(`${spoiler}${t.icon} __${t.value}__${spoiler}`);
				}
			}
			embed.addField(__('threats', lang), `${thrs.join('\n')}`, true);
		}

		// Sends the message.
		return await ctx.send(embed);
	},
};