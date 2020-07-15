const LOCALES = {
	en: {
		'yzm-bloodburster': 'Bloodburster',
		'yzm-neophyte': 'Juvenile Neomorph (Neophyte)',
		'yzm-neomorph': 'Adult Neomorph',
		'yzm-ovomorph': 'Ovomorph (Egg)',
		'yzm-queenegg': 'Queen\'s Egg',
		'yzm-facehugger': 'Facehugger',
		'yzm-praetofacehugger': 'Praeto-Facehugger',
		'yzm-royalfacehugger': 'Royal Facehugger',
		'yzm-chestburster': 'Chestburster',
		'yzm-bambiburster': 'Bambi Burster',
		'yzm-imp': 'Imp',
		'yzm-queenburster': 'Queenburster',
		'yzm-xeno-stalker': 'Stalker',
		'yzm-xeno-scout': 'Scout',
		'yzm-xeno-drone': 'Drone',
		'yzm-xeno-soldier': 'Soldier',
		'yzm-xeno-worker': 'Worker',
		'yzm-xeno-sentry': 'Sentry',
		'yzm-xeno-praetorian': 'Praetorian',
		'yzm-xeno-crusher': 'Crusher',
		'yzm-xeno-queen': 'Queen',
	},
};

module.exports.__ = (text, locale) => {
	const loc = Object.keys(LOCALES).includes(locale) ? locale : 'en';
	return Object.keys(LOCALES[loc]).includes(text) ? LOCALES[loc][text] : text;
};