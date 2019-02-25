const Rumors = require('../sheets/rumors.json');
const YZEmbed = require('../utils/YZEmbed.js');
const { rand, strLcFirst } = require('../utils/utils.js');

module.exports = {
	name: 'rumor',
	description: 'Tells a random rumor.',
	guildOnly: false,
	args: false,
	execute(args, message) {
		const nb = rand(1, Rumors.stories.length) - 1;
		const rumorStory = Rumors.stories[nb];

		// RumorStory is an Object with:
		// rumor.head: string
		// rumor.bodies: Array<string> (multiple possible ends)
		const rumorHead = rumorStory.head;
		const nbBody = rand(1, rumorStory.bodies.length) - 1;
		const rumorBody = rumorStory.bodies[nbBody];
		let rumorText = `${rumorHead} ${strLcFirst(rumorBody)}`;

		// Replaces all "[ ... / ... ]" by arrays,
		// then chooses one of the values at random.
		// Help: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_function_as_a_parameter
		rumorText = rumorText.replace(/\[([^[\]]+)\]/gmi, (match, p1) => {
			let text = '';
			const options = p1.split('/');
			if (options.length) {
				const rnd = rand(1, options.length) - 1;
				text += `**${options[rnd].trim()}**`;
			}
			return text;
		});

		const embed = new YZEmbed(`${Rumors.title} ...`, rumorText);

		message.channel.send(embed);
	},
};