const YZGenerator = require('./YZGenerator');
const LegendData = require('../data/legend-generator.json');

class FBLLegendGenerator extends YZGenerator {
	constructor() {
		super(LegendData);

		this.story = '';

		for (const key in this.source) {
			this.story += `${this.source[key].define}**${super.getElemFromParam(key).toLowerCase()}**`;
		}
		this.story += '.';
	}
}

module.exports = FBLLegendGenerator;