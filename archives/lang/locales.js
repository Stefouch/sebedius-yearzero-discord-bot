const LOCALES = {
	// English
	en: require('./en.json'),
	// German (Deutsch)
	de: require('./de.json'),
	// Svenska
	// sv: require('./sv.json'),
	// Français
	// fr: require('./fr.json'),
};

/**
 * Returns a locale entry (translated text)
 * @param {string} text The key to look for in the translation table
 * @param {string} locale The language code to use. Default is en (english)
 * @returns {string} The translated text
 */
module.exports.__ = (text, locale) => {
	if (typeof text !== 'string') return text;
	const key = text.replace(/_/g, '-').toLowerCase();
	const loc = locale in LOCALES ? locale : 'en';
	if (LOCALES[loc][key] != undefined) return LOCALES[loc][key];
	if (LOCALES.en[key] != undefined) return LOCALES.en[key];
	return text;
};