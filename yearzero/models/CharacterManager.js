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
	 * @param {*} data Character to add
	 * @param {boolean} cache Whether to add the character to the cache
	 * @param {Object} options
	 * @returns {Character}
	 */
	add(data, cache = true, { id } = {}) {
		// const existing = this.cache.get(id || data.id);
		// if (existing) return existing;

		const character = data instanceof Character ? data : this.create(data);
		if (cache) this.cache.set(id || character.id, character);
		return character;
	}

	/**
	 * Creates a Character.
	 * @param {Object} data Raw data of the character
	 * @returns {ForbiddenLandsCharacter|Character}
	 */
	create(data) {
		if (data.game === 'fbl') return new ForbiddenLandsCharacter(data.owner, data);
		return new Character(data.owner, data);
	}

	/**
	 * Removes some entries from the cache.
	 * @param {import('discord.js').Snowflake} id Character- and/or owner's ID
	 */
	remove(id) {
		this.cache.sweep(c => c.id === id || c.owner === id);
	}

	/**
	 * Removes all entries from the cache and the database for a single player.
	 * @param {import('discord.js').Snowflake} id Owner's ID
	 * @async
	 */
	async cleanse(id) {
		this.remove(id);
		await this.store.delete(id);
	}

	/**
	 * Saves a character to the database.
	 * @param {Character} character Character to save.
	 * @param {boolean} cleanse Whether old character entries should be removed in the process.
	 * @returns {Character} The saved character.
	 * @async
	 */
	async commit(character, cleanse = true) {
		// Gets all the existing player's characters.
		/** @type {Character[]} but in raw */
		let characters = await this.store.get(character.owner) || [];

		// Removes older entries.
		if (cleanse) {
			const now = Date.now();
			characters = characters.filter(c => now - c.ttl <= this.constructor.TTL);
		}

		// Removes existing entry(ies) that will be replaced.
		characters = characters.filter(c => c.id !== character.id);

		// Adds the new character to the list.
		characters.push(character.toRaw());

		// Stores in the database.
		const isSet = await this.store.set(character.owner, characters, this.constructor.TTL);
		if (!isSet) throw new Error(`Could not save the character(s) to the database for owner: ${character.owner}`);
		return this.add(character);
	}

	/**
	 * Obtains a character from the database, or the character cache if it's already available.
	 * @param {import('discord.js').Snowflake} characterID Character's ID
	 * @param {import('discord.js').Snowflake} ownerID Owner's ID
	 * @param {boolean} [cache=true] Whether to cache the new character object if it isn't already
	 * @param {boolean} [force=false] Whether to skip the cache check and request the API
	 * @returns {Promise<Character>}
	 */
	async fetch(characterID, ownerID, cache = true, force = false) {
		if (!force) {
			const existing = this.cache.get(characterID);
			if (existing) return existing;
		}
		const datas = await this.fetchAll(ownerID, cache);
		const data = datas.find(c => c.id === characterID);
		return this.add(data, cache);
	}

	/**
	 * Obtains all characters of a single player from the database.
	 * @param {import('discord.js').Snowflake} ownerID Owner's ID
	 * @param {boolean} [cache=false] Whether to cache the new character object if it isn't already
	 * @returns {Promise<Character[]>}
	 */
	async fetchAll(ownerID, cache = false) {
		const datas = await this.store.get(ownerID) || [];
		if (cache) for (const data of datas) this.add(data);
		return datas;
	}

	/**
	 * Imports a character from an API.
	 * @param {import('discord.js').Snowflake} ownerID Owner's ID
	 * @param {string} url URL where to fetch the character's data
	 * @returns {Promise<Character>}
	 * @async
	 */
	async import(ownerID, url) {
		let character;
		if (LasseForbiddenSheetParser.URL_REGEX.test(url)) {
			character = await new LasseForbiddenSheetParser(url)
				.loadCharacter(ownerID);
		}
		if (!character) throw new ReferenceError('@CharacterManager Import API - Unknown URL');
		return this.add(character);
	}
}

/**
 * Maximum TTL: 30 days.
 * @type {number}
 * @constant
 */
CharacterManager.TTL = 1000 * 60 * 60 * 24 * 30;

module.exports = CharacterManager;