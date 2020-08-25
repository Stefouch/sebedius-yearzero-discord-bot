const { readFileSync } = require('fs');
const CHANGELOG_FILE = './CHANGELOG.md';
let version = 0;

try {
	const fileContent = readFileSync(CHANGELOG_FILE, 'utf8');
	if (!fileContent) return 0;
	[, version] = fileContent.match(/^## \[(\d+\.\d+\.\d+)\]/m);
}
catch(error) {
	console.error(`[ERROR] - Unable to load "${CHANGELOG_FILE}"`, error);
}

module.exports = {
	/**
	 * A simple function that returns the version of the bot.
	 * @returns {string}
	 * @readonly
	 */
	get version() { return version; },
};