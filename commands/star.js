const YZEmbed = require('../util/YZEmbed');
const Star = require('../util/ALIENStarGenerator');
const Util = require('../util/Util');

module.exports = {
	name: 'star',
	type: 'ALIEN rpg',
	description: 'Generates a Star sector for the ALIEN rpg.',
	aliases: ['★'],
	guildOnly: false,
	args: false,
	usage: '',
	async execute(args, message, client) {
		const star = new Star();
		const embed = new YZStarEmbed(star);

		return message.channel.send('New star system discovered.\nPreliminary survey data:', embed);
	},
};

class YZStarEmbed extends YZEmbed {
	constructor(star) {
		super(
			`${star.code}-${Util.zeroise(Util.rand(1, 9999), 4)}`,
			`Type: ${star.name}\nOrbiting Objects: ${star.orbitSize}`,
		);

		let order = 1;
		if (star.orbitInnerSize > 0) {
			this.addField('\u200b', '\u200b');
			this.addField('`INNER ORBIT`', `*Number of objects: ${star.orbitInnerSize}*`);
			for (const o of star.orbit.inner) {
				this.addOrbitField(o, order);
				order++;
			}
		}
		if (star.orbitHabSize > 0) {
			this.addField('\u200b', '\u200b');
			this.addField('`HABITABLE ZONE ORBIT`', `*Number of objects: ${star.orbitHabSize}*`);
			for (const o of star.orbit.habitable) {
				this.addOrbitField(o, order);
				order++;
			}
		}
		if (star.orbitOuterSize > 0) {
			this.addField('\u200b', '\u200b');
			this.addField('`OUTER ORBIT`', `*Number of objects: ${star.orbitOuterSize}*`);
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