const Keyv = require('keyv');

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

module.exports = {
	/**
	 * Sets a value in the database with Keyv.
	 * @requires keyv
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
	},
	/**
	 * Gets the value in the database with Keyv.
	 * @requires keyv
	 * @param {string} key
	 * @param {?string} namespace
	 * @returns {string} The fetched value
	 * @async
	 */
	async get(key, namespace = null) {
		const db = getDatabase(namespace);
		return await db.get(key);
	},
};

function getDatabase(namespace) {
	const db = new Keyv(process.env.DATABASE_URL, { namespace });
	db.on('error', err => console.error('Connection Error', err));
	return db;
}