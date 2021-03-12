const LOCALES = {
	// English
	en: require('./en.json'),
	// German (Deutsch)
	de: require('./de.json'),
};

module.exports.__ = (text, locale) => {
	const loc = LOCALES[locale] ? locale : 'en';
	if (LOCALES[loc][text]) return LOCALES[loc][text];
	else if (LOCALES.en[text]) return LOCALES.en[text];
	return text;
};