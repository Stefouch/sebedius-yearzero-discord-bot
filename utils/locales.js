const LOCALES = {
	en: {
		none: 'none',
		damage: 'damage',
		'base-dice': 'Base Dice',
		'malien-xeno-bloodburster': 'Bloodburster',
		'malien-xeno-neophyte': 'Juvenile Neomorph (Neophyte)',
		'malien-xeno-neomorph': 'Adult Neomorph',
		'malien-xeno-ovomorph': 'Ovomorph (Egg)',
		'malien-xeno-queenegg': 'Queen\'s Egg',
		'malien-xeno-facehugger': 'Facehugger',
		'malien-xeno-praetofacehugger': 'Praeto-Facehugger',
		'malien-xeno-royalfacehugger': 'Royal Facehugger',
		'malien-xeno-chestburster': 'Chestburster',
		'malien-xeno-bambiburster': 'Bambi Burster',
		'malien-xeno-imp': 'Imp',
		'malien-xeno-queenburster': 'Queenburster',
		'malien-xeno-stalker': 'Stalker',
		'malien-xeno-scout': 'Scout',
		'malien-xeno-drone': 'Drone',
		'malien-xeno-soldier': 'Soldier',
		'malien-xeno-worker': 'Worker',
		'malien-xeno-sentry': 'Sentry',
		'malien-xeno-praetorian': 'Praetorian',
		'malien-xeno-crusher': 'Crusher',
		'malien-xeno-queen': 'Queen',
		'malien-swarm': 'The Swarm',
		'malien-adultharvester': 'Harvester',
		'malien-juvenileharvester': 'Harvester Juvenile',
		'malien-lionworm': 'Lion Worm',
		'malien-scorpionid-onland': 'Tanakan Scorpionid (On Land)',
		'malien-scorpionid-inwater': 'Tanakan Scorpionid (In Water)',
	},
};

module.exports.__ = (text, locale) => {
	const loc = Object.keys(LOCALES).includes(locale) ? locale : 'en';
	if (Object.keys(LOCALES[loc]).includes(text)) {
		return LOCALES[loc][text];
	}
	else if (Object.keys(LOCALES.en).includes(text)) {
		return LOCALES.en[text];
	}
	return text;
};