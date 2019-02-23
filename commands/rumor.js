const Rumors = require('../sheets/rumors.json');
const YZEmbed = require('../utils/YZEmbed.js');
const { rand } = require('../utils/utils.js');

module.exports = {
	name: 'rumor',
	description: 'Tells a random rumor.',
	// aliases: ['mut'],
	guildOnly: false,
	args: false,
	// usage: '',
	execute(args, message) {
		const nb = rand(1, Rumors.myz.length) - 1;
		const rumorObject = Rumors.myz[nb];

		// RumorObject is an Object with:
		// rumor.start: string
		// rumor.ends: Array<string> (multiple ends)
		const rumorStart = rumorObject.start;
		const nbEnd = rand(1, rumorObject.ends.length) - 1;
		const rumorEnd = rumorObject.ends[nbEnd];

		let rumorText = rumorStart + ' ' + strLcFirst(rumorEnd);
		rumorText = rumorText.replace(/\[([^[\]]+)\]/gmi, (correspondance, p1, decalage, chaine) => {
			// Help: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/String/replace#Indiquer_une_fonction_comme_param%C3%A8tre
			let text = '';
			const options = p1.split('/');
			if (options.length) {
				const rnd = rand(1, options.length) - 1;
				text += '**' + options[rnd].trim() + '**';
			}
			return text;
		});

		const embed = new YZEmbed(Rumors.init + '...', rumorText);

		message.channel.send(embed);
	},
};

function strLcFirst(str) {
	return str.charAt(0).toLowerCase() + str.slice(1);
}