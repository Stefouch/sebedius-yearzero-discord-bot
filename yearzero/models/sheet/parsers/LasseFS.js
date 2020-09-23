const fetch = require('node-fetch');
const SheetParser = require('./SheetParser');
const ForbiddenLandsCharacter = require('../FBLCharacter');
const { trimString } = require('../../../../utils/Util');

/**
 * Imports a Forbidden Lands character sheet from Lasse's forbidden-sheets.com
 * @extends {SheetParser}
 */
class LasseForbiddenSheetParser extends SheetParser {
	/**
	 * @param {string} url The URL where to fetch the character.
	 */
	constructor(url) {
		super(url);
	}

	/**
	 * Loads the character.
	 * @param {import('discord.js').Snowflake} ownerID Owner's ID
	 * @returns {Promise<ForbiddenLandsCharacter>}
	 */
	async loadCharacter(ownerID) {
		const data = await this.fetch();

		const char = new ForbiddenLandsCharacter(ownerID, {
			url: this.url,
			name: trimString(data.name, 100),
			kin: trimString(data.kin, 100),
			profession: trimString(data.profession, 100),
			attributes: this.getAttributes(),
			skills: this.getSkills(),
			armor: this.getArmorRating(),
			weapons: this.getWeapons(),
			hungry: data.hungry,
			thirsty: data.thirsty,
			sleepy: data.sleepy,
			cold: data.cold,
		});

		char.description = `Kin: *${char.kin}*\nProfession: *${char.profession}*`;

		return char;
	}

	/**
	 * Fetches the data.
	 * @module node-fetch
	 * @returns {Promise<Object>}
	 * @async
	 */
	async fetch() {
		const id = this.constructor.URL_REGEX.exec(this.url)[1];
		const response = await fetch(this.constructor.URI + id);
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
					value: +this.characterData[a] || 0,
					trauma: this.countPips(a, true),
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
	 * Creates an array of weapons.
	 * @type {Weapon[]}
	 */
	getWeapons() {
		const weapons = [];
		for (let i = 1; i <= 5; i++) {
			if (this.characterData[`weapon${i}`] && this.characterData[`weapon${i}`].length) {
				weapons.push({
					name: trimString(this.characterData[`weapon${i}`], 100),
					bonus: +this.characterData[`weapon${i}Bonus`],
					damage: +this.characterData[`weapon${i}Damage`],
					range: trimString(this.characterData[`weapon${i}Range`], 10),
					comment: trimString(this.characterData[`weapon${i}Comment`], 100),
					source: 'fbl',
					weight: 1,
				});
			}
		}
		return weapons;
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

LasseForbiddenSheetParser.URL = 'https://www.forbidden-sheets.com/?id=';
LasseForbiddenSheetParser.URL_REGEX = /^https:\/\/www\.forbidden-sheets\.com\/\?(?:sheet|id)=([a-zA-Z0-9]+)$/;
LasseForbiddenSheetParser.URI = 'https://europe-west1-forbidden-sheets.cloudfunctions.net/sheets?id=';
//LasseForbiddenSheetParser.URI_REGEX = /^https:\/\/europe-west1-forbidden-sheets\.cloudfunctions\.net\/sheets\?id=([a-zA-Z0-9]+)$/;

module.exports = LasseForbiddenSheetParser;