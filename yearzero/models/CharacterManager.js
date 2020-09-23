const { Collection } = require('discord.js');
const Character = require('./sheet/Character');
const ForbiddenLandsCharacter = require('./sheet/FBLCharacter');
const LasseForbiddenSheetParser = require('./sheet/parsers/LasseFS');

/**
 * Manages the character sheets and holds its cache.
 */
class CharacterManager {
	constructor(store, iterable, cacheType = Collection) {
		/**
		 * The database of the manager.
		 * @type {import('keyv')}
		 */
		this.store = store;

		/**
		 * The type of Collection of the Manager.
		 * @type {Collection}
		 */
		this.cacheType = cacheType;

		/**
		 * Holds the cache for the data model.
		 * @type {Collection<import('discord.js').Snowflake, Character>}
		 */
		this.cache = new cacheType();
		if (iterable) for (const i of iterable) this.add(i);
	}

	/**
	 * Adds to cache.
	 * @param {Object|Character} data Character to add
	 * @param {boolean} cache Whether to add the character to the cache
	 * @param {Object} options Additional options
	 * @param {?string} options.id Custom owner's ID
	 * @returns {Character}
	 */
	add(data, cache = true, { id } = {}) {
		// const existing = this.cache.get(id || data.id);
		// if (existing) return existing;
		const character = data instanceof Character ? data : this.create(data, id);
		if (cache) this.cache.set(id || character.id, character);
		return character;
	}

	/**
	 * Creates a Character.
	 * @param {Object} data Raw data of the character
	 * @param {?string} owner Custom owner's ID
	 * @returns {ForbiddenLandsCharacter|Character}
	 */
	create(data, owner) {
		if (data.game === 'fbl') return new ForbiddenLandsCharacter(owner || data.owner, data);
		return new Character(data.owner, data);
	}

	/**
	 * Fetches a character from the cache and/or the database.
	 * @param {string} ownerID Owner's ID
	 * @param {boolean} cache Whether to add the fetched character to the cache
	 * @param {string} force Whether to skip the cache check
	 * @returns {Character}
	 * @async
	 */
	async fetch(ownerID, cache = true, force = false) {
		if (!force) {
			const existing = this.cache.find(c => c.owner === ownerID && c.active);
			if (existing) return existing;
		}

		const characters = await this.store.get(ownerID);
		const activeCharacter = characters.find(c => c.active);
		return this.add(activeCharacter, cache);
	}

	/**
	 * Deletes a Character from the cache and the database.
	 * If `charID` is omitted, instead deletes all the owner's Characters.
	 * @param {string} ownerID Owner's ID
	 * @param {string} charID Character's ID
	 * @async
	 */
	async delete(ownerID, charID) {
		if (!charID) {
			this.cache.sweep(c => c.owner === ownerID);
			await this.store.delete(ownerID);
		}
		else {
			this.cache.delete(charID);
			const characters = (await this.store.get(ownerID) || [])
				.filter(c => c.id !== charID);

			if (!characters.length) await this.store.delete(ownerID);
			else await this.commit(ownerID, characters);
		}
	}

	/**
	 * Saves a Character in the database.
	 * @param {Character} character Character to save in the database
	 * @async
	 */
	async save(character) {
		const characters = (await this.store.get(character.owner) || [])
			.filter(c => c.id !== character.id);

		characters.push(character instanceof Character ? character.toRaw() : character);
		await this.commit(character.owner, characters);
	}

	/**
	 * Sets a Character as the active one.
	 * @param {Character} character Character to set active
	 * @async
	 */
	async setActive(character) {
		const characters = (await this.store.get(character.owner) || []);
		characters.forEach(c => c.active = false);

		const activeCharacter = characters.find(c => c.id === character.id);
		character.active = true;
		activeCharacter.active = true;

		await this.commit(character.owner, characters);
	}

	/**
	 * Saves all the player's characters to the database.
	 * @param {string} ownerID Owner's ID
	 * @param {Character[]} characters Array of raw Characters
	 * @async
	 */
	async commit(ownerID, characters) {
		const isSet = await this.store.set(ownerID, characters);
		if (!isSet) throw new Error('@CharacterManager #Commit - COULD NOT SAVE TO DATABASE');
	}

	/**
	 * Imports a character from an API.
	 * @param {import('discord.js').Snowflake} ownerID Owner's ID
	 * @param {string} url URL where to fetch the character's data
	 * @param {boolean} [active=true] Whether to set the imported character as active
	 * @param {boolean} [cache=true] Whether to store the character in the cache
	 * @param {boolean} [store=true] Whether to store the character in the database
	 * @returns {Promise<Character>}
	 * @async
	 */
	async import(ownerID, url, active = true, cache = true, store = true) {
		let character;
		if (LasseForbiddenSheetParser.URL_REGEX.test(url)) {
			character = await new LasseForbiddenSheetParser(url)
				.loadCharacter(ownerID);
		}
		if (!character) throw new ReferenceError('@CharacterManager #Import - Unknown URL');
		if (store) await this.save(character);
		if (active) await this.setActive(character);
		return this.add(character, cache);
	}
}

/**
 * Maximum TTL: 30 days.
 * @type {number}
 * @constant
 */
CharacterManager.TTL = 1000 * 60 * 60 * 24 * 30;

module.exports = CharacterManager;