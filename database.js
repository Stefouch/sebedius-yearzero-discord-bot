const fs = require('fs');

const DB_PATH = './database.json';

module.exports = {
	/**
	 * Sets a value for a key in the JSON database.
	 * @param {string} key The database's key to set
	 * @param {string} value The new value for the key
	 */
	set(key, value) {
		let content;
		try {
			content = fs.readFileSync(DB_PATH, 'utf8');
		}
		catch(error) {
			console.error('[ERROR] - [DB] - Unable to read database file.', error);
		}

		if (content) {
			const db = JSON.parse(content);
			db[key] = value;
			content = JSON.stringify(db, null, 4);
			try {
				fs.writeFileSync(DB_PATH, content, 'utf8');
				console.log(`[DB] - Set: "${key}" = "${value}"`);
			}
			catch(error) {
				console.error(`[ERROR] - [DB] - Unable to write "${key}" to database.`, error);
			}
		}
	},

	/**
	 * Gets the value of a key in the JSON database.
	 * @param {string} key The database's key
	 * @returns {string}
	 */
	get(key) {
		const content = fs.readFileSync(DB_PATH, 'utf8');
		const db = JSON.parse(content);
		return db[key];
	},

	/**
	 * Gets the list of all values in the database.
	 * @returns {string[]} An array with all keys and their values
	 */
	list() {
		const data = [];
		try {
			const content = fs.readFileSync(DB_PATH, 'utf8');
			const db = JSON.parse(content);

			for (const key in db) {
				data.push(`"${key}": "${db[key]}",`);
			}
		}
		catch(error) {
			console.error('[ERROR] - [DB] - Unable to list the database.', error);
		}
		return data;
	},
};