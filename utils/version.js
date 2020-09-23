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

/**
 * A simple function that returns the version of the bot.
 * @returns {string}
 * @readonly
 */
module.exports = `${version}`;