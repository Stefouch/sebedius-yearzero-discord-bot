const { YZEmbed } = require('../utils/embeds');
const { random, strLcFirst } = require('../utils/Util');

module.exports = {
	name: 'rumor',
	category: 'myz',
	description: 'crumor-description',
	guildOnly: false,
	args: false,
	usage: '[-lang <language_code>]',
	async run(args, ctx) {
		// Parses arguments.
		const argv = require('yargs-parser')(args, {
			string: ['lang'],
			alias: {
				lang: ['lng', 'language'],
			},
			default: {
				lang: null,
			},
			configuration: ctx.bot.config.yargs,
		});
		const lang = await ctx.bot.getValidLanguageCode(argv.lang, ctx);
		const Rumors = require(`../gamedata/myz/rumors.${lang}.json`);

		const rumorStory = random(Rumors.stories);

		// RumorStory is an Object with:
		// rumor.head: string
		// rumor.bodies: Array<string> (multiple possible ends)
		const rumorHead = rumorStory.head;
		const rumorBody = random(rumorStory.bodies);
		let rumorText = `${rumorHead} ${strLcFirst(rumorBody)}`;

		// Replaces all "[ ... / ... ]" by arrays,
		// then chooses one of the values at random.
		// Help: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_function_as_a_parameter
		rumorText = rumorText.replace(/\[([^[\]]+)\]/gmi, (match, p1) => {
			let text = '';
			const options = p1.split('/');
			if (options.length) {
				text += `**${random(options).trim()}**`;
			}
			return text;
		});

		const embed = new YZEmbed(`${Rumors.title} ...`, rumorText);

		return ctx.send(embed);
	},
};