const Rumors = require('../gamedata/myz/rumors.json');
const { YZEmbed } = require('../utils/embeds');
const Util = require('../utils/Util');

module.exports = {
	name: 'rumor',
	group: 'Mutant: Year Zero',
	description: 'Tells a random rumor.',
	guildOnly: false,
	args: false,
	usage: '',
	async execute(args, ctx) {
		const rumorStory = Util.random(Rumors.stories);

		// RumorStory is an Object with:
		// rumor.head: string
		// rumor.bodies: Array<string> (multiple possible ends)
		const rumorHead = rumorStory.head;
		const rumorBody = Util.random(rumorStory.bodies);
		let rumorText = `${rumorHead} ${Util.strLcFirst(rumorBody)}`;

		// Replaces all "[ ... / ... ]" by arrays,
		// then chooses one of the values at random.
		// Help: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_function_as_a_parameter
		rumorText = rumorText.replace(/\[([^[\]]+)\]/gmi, (match, p1) => {
			let text = '';
			const options = p1.split('/');
			if (options.length) {
				text += `**${Util.random(options).trim()}**`;
			}
			return text;
		});

		const embed = new YZEmbed(`${Rumors.title} ...`, rumorText);

		return ctx.channel.send(embed);
	},
};