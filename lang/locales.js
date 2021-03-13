const LOCALES = {
	// English
	en: require('./en.json'),
	// German (Deutsch)
	de: require('./de.json'),
};

/**
 * Returns a locale entry (translated text)
 * @param {string} text The key to look for in the translation table
 * @param {string} locale The language code to use. Default is en (english)
 */
module.exports.__ = (text, locale) => {
	if (typeof text != 'string') return text;
	text = text.replace(/_/g, '-').toLowerCase();
	const loc = LOCALES[locale] ? locale : 'en';
	if (LOCALES[loc][text]) return LOCALES[loc][text];
	else if (LOCALES.en[text]) return LOCALES.en[text];
	return text;
};