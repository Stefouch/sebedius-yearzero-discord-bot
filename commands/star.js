const Star = require('../generators/ALIENStarGenerator');
const { YZEmbed } = require('../utils/embeds');
const { zeroise, rand } = require('../utils/Util');
const { __ } = require('../lang/locales');

module.exports = {
	name: 'star',
	aliases: ['★'],
	category: 'alien',
	description: 'cstar-description',
	guildOnly: false,
	args: false,
	usage: '[-lang <language_code>]',
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

		const star = new Star(lang);
		const embed = new YZStarEmbed(star);

		return ctx.send(__('cstar-prolog', lang), embed);
	},
};

class YZStarEmbed extends YZEmbed {
	/**
	 * Constructor of the star embed
	 * @param {Star} star 
	 */
	constructor(star) {
		super(
			`${star.code}-${zeroise(rand(1, 9999), 4)}`,
			`${__('cstar-type', star.lang)}: ${star.name}\n${__('cstar-orbiting-objects', star.lang)}: ${star.orbitSize}`,
		);

		let order = 1;
		if (star.orbitInnerSize > 0) {
			this.addField('\u200b', '\u200b');
			this.addField(`\`${__('cstar-inner-orbit', star.lang).toUpperCase()}\``,
						`*${__('cstar-number-of-objects', star.lang)}: ${star.orbitInnerSize}*`);
			for (const o of star.orbit.inner) {
				this.addOrbitField(o, order);
				order++;
			}
		}
		if (star.orbitHabSize > 0) {
			this.addField('\u200b', '\u200b');
			this.addField(`\`${__('cstar-habitable-zone-orbit', star.lang).toUpperCase()}\``,
						`*${__('cstar-number-of-objects', star.lang)}: ${star.orbitHabSize}*`);
			for (const o of star.orbit.habitable) {
				this.addOrbitField(o, order);
				order++;
			}
		}
		if (star.orbitOuterSize > 0) {
			this.addField('\u200b', '\u200b');
			this.addField(`\`${__('cstar-outer-orbit', star.lang).toUpperCase()}\``,
						`*${__('cstar-number-of-objects', star.lang)}: ${star.orbitOuterSize}*`);
			for (const o of star.orbit.outer) {
				this.addOrbitField(o, order);
				order++;
			}
		}
	}

	/**
	 * Discord.RichEmbed.addField() for celestial objects in orbit.
	 * @param {ALIENWorldGenerator} o Celestial object in orbit
	 * @param {number} order
	 * @returns {YZStarEmbed} this
	 */
	addOrbitField(o, order) {
		this.addField(`${order}. ${o.title}`, o.description, false);
		return this;
	}
}