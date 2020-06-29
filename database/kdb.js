const Keyv = require('keyv');

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

class SebediusDB {
	constructor(namespace, databaseUrl) {
		this.namespace = namespace;
		this.url = databaseUrl;
		this.db = this.getDatabase();
	}
	getDatabase() {
		const db = new Keyv(this.url, { namespace: this.namespace });
		db.on('error', err => console.error('Connection Error', err));
		return db;
	}
	/**
	 * Sets a value in the database with Keyv.
	 * @requires Keyv
	 * @param {string} key
	 * @param {string} value
	 * @param {?string} namespace
	 * @param {?number} ttl Expiration time
	 * @returns {boolean}
	 * @async
	 */
	async set(key, value, namespace = null, ttl = null) {
		const db = getDatabase(namespace);
		return await db.set(key, value, ttl);
	}
	/**
	 * Gets the value in the database with Keyv.
	 * @requires Keyv
	 * @param {string} key
	 * @param {?string} namespace
	 * @returns {string} The fetched value
	 * @async
	 */
	async get(key, namespace = null) {
		const db = getDatabase(namespace);
		return await db.get(key);
	}
	/**
	 * Deletes the value in the database with Keyv.
	 * @requires Keyv
	 * @param {string} key
	 * @param {?string} namespace
	 * @returns {boolean}
	 */
	async delete(key, namespace = null) {
		const db = getDatabase(namespace);
		return await db.delete(key);
	}
	/**
	 * Clears all values in the namespace.
	 * @param {string} namespace
	 */
	async clear(namespace) {
		const db = getDatabase(namespace);
		return await db.clear();
	}
}