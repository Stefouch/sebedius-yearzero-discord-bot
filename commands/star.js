const YZEmbed = require('../util/YZEmbed');
const Star = require('../util/ALIENStarGenerator');
const Util = require('../util/Util');

module.exports = {
	name: 'star',
	description: 'Generates a Star sector for the ALIEN rpg.'
		+ '',
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
		super(`${star.code}-${Util.zeroise(Util.rand(1, 9999), 4)}`, star.name);

		let order = 1;
		for (const o of star.orbit.inner) {
			this.addOrbitField(o, order);
			order++;
		}
		for (const o of star.orbit.habitable) {
			this.addOrbitField(o, order);
			order++;
		}
		for (const o of star.orbit.outer) {
			this.addOrbitField(o, order);
			order++;
		}
	}

	/**
	 * Discord.RichEmbed.addField() for celestial objects in orbit.
	 * @param {ALIENWorldGenerator} o Celestial object in orbit
	 * @param {number} order
	 * @returns {YZStarEmbed} this
	 */
	addOrbitField(o, order) {
		let text;
		if (o.type === 'gasgiant') text = getGasGiantText(o);
		else if (o.type === 'asteroid-belt') text = getBeltText(o);
		else text = getPlanetText(o);

		this.addField(`${order}. ${text.title}`, text.desc, false);
		return this;
	}
}

function getGasGiantText(o) {
	const title = `${o.code} (${o.temperature.name} Gas Giant)`;
	const desc = `${o.size} Km, ${o.gravity} G, ${o.temperature.description}`;
	return { title, desc };
}

function getBeltText(o) {
	const title = 'Asteroid Belt';
	const desc = `${o.terrain}.`;
	return { title, desc };
}

function getPlanetText(o) {
	const title = `${o.code} (${o.temperature.name} ${o.geosphere.name} World)`;
	const desc = `${o.size} Km, ${o.gravity} G, ${o.temperature.description}`
		+ `\n${o.atmosphere} atmosphere. ${o.terrain}.`
		+ `\n${o.geosphere.description}.`;
	return { title, desc };
}