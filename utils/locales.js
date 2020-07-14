const LOCALES = {
	en: {
		bloodburster: 'Bloodburster',
		neophyte: 'Juvenile Neomorph (Neophyte)',
		neomorph: 'Adult Neomorph',
		ovomorph: 'Ovomorph (Egg)',
		queenegg: 'Queen\'s Egg',
		facehugger: 'Facehugger',
		praetofacehugger: 'Praeto-Facehugger',
		royalfacehugger: 'Royal Facehugger',
		chestburster: 'Chestburster',
		bambiburster: 'Bambi Burster',
		imp: 'Imp',
		queenburster: 'Queenburster',
	},
};

module.exports.__ = (text, locale) => {
	const loc = Object.keys(LOCALES).includes(locale) ? locale : 'en';
	return Object.keys(LOCALES[loc]).includes(text) ? LOCALES[loc][text] : text;
}