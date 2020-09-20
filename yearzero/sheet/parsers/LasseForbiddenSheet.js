const fetch = require('node-fetch');
const SheetLoader = require('./SheetLoader');
const ForbiddenLandsCharacter = require('../FBLCharacter');

class LasseForbiddenSheet extends SheetLoader {
	constructor(url) {
		super(url);
	}

	/**
	 * Loads the character.
	 * @param {import('discord.js').Snowflake} id Owner's ID
	 * @returns {Promise<ForbiddenLandsCharacter>}
	 */
	async loadCharacter(id) {
		const data = await this.fetch();

		const char = new ForbiddenLandsCharacter(id, {
			name: data.name,
			attributes: this.getAttributes(),
			skills: this.getSkills(),
			armor: this.getArmorRating(),
		});

		return char;
	}

	/**
	 * Fetches the data.
	 * @module node-fetch
	 * @returns {Promise<Object>}
	 * @async
	 */
	async fetch() {
		const response = await fetch(this.url);
		const data = await response.json();
		this.characterData = data[0];
		return data[0];
	}

	/**
	 * Creates an array of attributes' raw data.
	 * @returns {Object[]}
	 */
	getAttributes() {
		return ['strength', 'agility', 'wits', 'empathy']
			.map(a => {
				return {
					name: a,
					value: (+this.characterData[a] || 0) - this.countPips(a, false),
				};
			});
	}

	/**
	 * Creates an array of skills' raw data.
	 * @returns {Object[]}
	 */
	getSkills() {
		return [
			'might',
			'endurance',
			'melee',
			'crafting',
			'stealth',
			'sleightOfHand',
			'move',
			'marksmanship',
			'scouting',
			'lore',
			'survival',
			'insight',
			'manipulation',
			'performance',
			'healing',
			'animalHandling',
		].map(s => {
			return {
				name: s,
				value: +this.characterData[s] || 0,
			};
		});
	}

	/**
	 * Calculates the total Armor Rating.
	 * @returns {number}
	 */
	getArmorRating() {
		return +this.characterData.armorRating
			+ +this.characterData.helmetRating
			+ +this.characterData.shieldBonus;
	}

	/**
	 * Counts checked or unchecked pips for a given property.
	 * @param {string} propertyName property$
	 * @param {boolean} checked Whether to count checked or unchecked pips
	 */
	countPips(propertyName, checked = true) {
		let count = 0;
		let n = 1;
		while (this.characterData[`${propertyName}${n}`] != undefined && n < 100) {
			if (this.characterData[`${propertyName}${n}`] === checked) count++;
			n++;
		}
		return count;
	}
}

LasseForbiddenSheet.URL_REGEX = /^https:\/\/europe-west1-forbidden-sheets.cloudfunctions.net\/sheets\?id=([a-zA-Z0-9]+)$/;

module.exports = LasseForbiddenSheet;