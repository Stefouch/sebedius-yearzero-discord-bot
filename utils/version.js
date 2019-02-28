const fs = require('fs');

const versionfile = './CHANGELOG.md';

module.exports = {
	/**
	 * A simple function that returns the version of the bot.
	 * @returns {string}
	 */
	get version() {
		let fileContent;

		try {
			fileContent = fs.readFileSync(versionfile, 'utf8');
		}
		catch(error) {
			console.error(`[ERROR] - Unable to load "${versionfile}"`, error);
		}

		if (!fileContent) return 0;

		const [, matchedVersion] = fileContent.match(/^## \[(\d+\.\d+\.\d+)\]/m);
		return matchedVersion;
	},
};