const fs = require('fs');

const DB_PATH = './database.json';

module.exports = {
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
	get(key) {
		const content = fs.readFileSync(DB_PATH, 'utf8');
		const db = JSON.parse(content);
		return db[key];
	},
};