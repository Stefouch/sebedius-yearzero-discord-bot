const YZGenerator = require('./YZGenerator');
const { RollParser } = require('../utils/RollParser');
const { KEEP_CAPITALIZATION_LANGS } = require('../utils/constants');

class FBLLegendGenerator extends YZGenerator {
	constructor(lang = 'en') {
		const LegendData = require(`../gamedata/fbl/legend-generator.${lang}.json`);
		super(LegendData);

		/**
		 * The text of the legend.
		 * @type {string}
		 */
		this.story = '';

		// Completes the story.
		for (const key in this.data) {
			this.story += `${this.data[key].define}**${KEEP_CAPITALIZATION_LANGS.includes(lang) ? this.data[key].value : this.data[key].value.toLowerCase()}**`;
		}
		this.story = RollParser.supersede(this.story)

		// Ends the story.
		this.story += '.';
	}
}

module.exports = FBLLegendGenerator;