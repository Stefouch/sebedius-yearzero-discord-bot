const YZZoneSector = require('../yearzero/YZZoneSector');
const { SUPPORTED_LANGS } = require('../utils/constants');
const { MessageEmbed } = require('discord.js');
const { capitalize } = require('../utils/Util');

module.exports = {
	name: 'sector',
	aliases: ['zonesector'],
	category: 'myz',
	description: 'Creates a random Zone sector.',
	moreDescriptions: [
		[],
	],
	guildOnly: false,
	args: false,
	usage: '[-lang <code>] [-night|dark]',
	async run(args, ctx) {
		const argv = require('yargs-parser')(args, {
			boolean: ['night'],
			string: ['lang'],
			alias: {
				lang: ['lng', 'language'],
				night: ['dark'],
			},
			default: {
				lang: 'en',
				night: false,
			},
			configuration: ctx.bot.config.yargs,
		});
		const lang = Object.keys(SUPPORTED_LANGS).includes(argv.lang) ? argv.lang : 'en';
		const fileName = `./gamedata/myz/myz-zonesectors.${lang}.data.yml`;

		const zs = new YZZoneSector(fileName, {});

		const embed = new MessageEmbed({
			color: ctx.bot.config.color,
			title: `Zone Sector: ${zs.environment}`,
			description: `${zs.data.rotLevel.name}: **${zs.rotLevel}** – *${zs.rotType}*`
			+ `\nThreat Level: **${zs.threatLevel}**`,
		});

		if (zs.hasRuin) {
			embed.addField(zs.ruins.name, zs.ruins.description);
		}

		if (zs.mood) {
			embed.addField('Mood', zs.mood);
		}

		if (zs.hasFinds) {
			embed.addField(
				'Finds',
				Object.entries(zs.finds)
					.filter(f => f[1] > 0)
					.map(f => `${capitalize(f[0])}: **${f[1]}**`)
					.join('\n'),
				false,
			);
		}

		if (zs.threats.length) {
			let desc = [];
			zs.threats.forEach(threat => {
				desc.push(threat);
			});
			embed.addField('Threats', desc.join('\n'), false);
		}

		return await ctx.send(embed);
	},
};