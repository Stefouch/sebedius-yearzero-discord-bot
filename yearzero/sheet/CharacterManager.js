const Keyv = require('keyv');
const { Collection } = require('discord.js');
const Character = require('./Character');
const LasseForbiddenSheet = require('./parsers/LasseForbiddenSheet');

/**
 * Manages the character sheets and holds its cache.
 */
class CharacterSheetManager {
	constructor(client, iterable, cacheType = Collection) {
		/**
		 * The client that instantiated this Manager.
		 * @name client
		 * @type {import('discord.js').Client}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

		/**
		 * The database of the manager.
		 * @type {Keyv}
		 */
		this.store = new Keyv(client.dbUri, { namespace: 'character' });
		this.store.on('error', err => console.error('Keyv Connection Error: CHARACTERS\n', err));

		/**
		 * The type of Collection of the Manager.
		 * @type {Collection}
		 */
		this.cacheType = cacheType;

		/**
		 * Holds the cache for the data model.
		 * @type {Collection}
		 */
		this.cache = new cacheType();
		if (iterable) for (const i of iterable) this.add(i);
	}

	/**
	 * Adds to cache.
	 * @param {*} data 
	 * @param {boolean} cache 
	 * @param {boolean} store 
	 * @param {string} id
	 */
	add(data, cache = true, store = true, { id, extras = [] } = {}) {
		const existing = this.cache.get(id || data.id);
		if (existing) return existing;

		// TODO
		const entry = data ? new Character(id, data, ...extras) : data;
		if (cache) {
			this.cache.set(id || entry.id, entry);
		}
		return entry;
	}

	/**
	 * Obtains a character from an url, or the character cache if it's already available.
	 * @param {import('discord.js').Snowflake} id ID of the character or the url.
	 * @param {boolean} [cache=true] Whether to cache the new character object if it isn't already
	 * @param {boolean} [force=false] Whether to skip the cache check and request the API
	 * @returns {Promise<Character>}
	 */
	async fetch(id, cache = true, force = false) {
		if (!force) {
			const existing = this.cache.get(id);
			if (existing) return existing;
		}

		let character;
		if (LasseForbiddenSheet.URL_REGEX.test(id)) {
			character = await new LasseForbiddenSheet(id)
				.loadCharacter(id);
		}
		return this.add(character, cache);
	}
}

module.exports = CharacterSheetManager;