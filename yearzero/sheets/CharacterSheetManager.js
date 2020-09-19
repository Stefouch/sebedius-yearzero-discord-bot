const fetch = require('node-fetch');
const { Collection } = require('discord.js');

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

	add(data, cache = true, { id, extras = [] } = {}) {
		const existing = this.cache.get(id || data.id);
		if (existing) return existing;

		// TODO
		// const entry = ??
		return undefined;
	}

	fetch() {
		fetch(
			'https://europe-west1-forbidden-sheets.cloudfunctions.net/sheets?id=86pfPIwYjojqrZorEwJo',
		)
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				console.log(data);
			});
	}
}

module.exports = CharacterSheetManager;