const YZGenerator = require('./YZGenerator');
const LegendData = require('../data/legend-generator.json');

class FBLLegendGenerator extends YZGenerator {
	constructor() {
		super(LegendData);

		/**
		 * The text of the legend.
		 * @type {string}
		 */
		this.story = '';

		// Completes the story.
		for (const key in this.data) {
			this.story += `${this.data[key].define}**${this.data[key].value[0].toLowerCase()}**`;
		}

		// Ends the story.
		this.story += '.';
	}
}

module.exports = FBLLegendGenerator;