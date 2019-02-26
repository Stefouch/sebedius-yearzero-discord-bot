const fs = require('fs');

module.exports = {
	/**
	 * A simple function that returns the version of the bot.
	 * @param {string} file The path of CHANGELOG.md
	 * @returns {string}
	 */
	getVersion(file) {
		let fileContent;

		try {
			fileContent = fs.readFileSync(file, 'utf8');
		}
		catch(error) {
			console.error(`[ERROR] - Unable to load "${file}"`, error);
		}

		if (!fileContent) return 0;

		const [, matchedVersion] = fileContent.match(/^## \[(\d+\.\d+\.\d+)\]/m);
		return matchedVersion;
	},
};