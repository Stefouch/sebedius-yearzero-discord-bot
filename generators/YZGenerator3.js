const { readFileSync } = require('fs');
const { parse } = require('yaml');
const { isObject } = require('../utils/Util');
const RollTable = require('../utils/RollTable');

/**
 * Third generation of my Year Zero Generator.
 * @see {@link https://symfony.com/doc/current/components/yaml/yaml_format.html YAML Format}
 */
class YZGenerator3 {
	constructor() {
		throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
	}

	static parse(filename) {
		const fileContent = readFileSync(filename, 'utf-8');
		const data = parse(fileContent);

		return Object.keys(data).reduce((obj, property) => {
			obj[property] = YZGenerator3.parseRollTable(data[property]);
			return obj;
		}, {});
	}

	/**
	 * @typedef RollTableData
	 * @property {string} name → RollTable.name
	 * @property {string} roll → RollTable.d
	 * @property {Object} refs <K, V>
	 * @property {string|string[]|RollTableData} refs.[ref]
	 */

	/**
	 * Parses a new RollTable from input data.
	 * @param {RollTableData} data RollTable data
	 * @returns {RollTable}
	 * @static
	 */
	static parseRollTable(data) {
		if (!data.refs) throw new TypeError('No References');

		const rt = new RollTable(data.name, data.roll);

		for (const ref in data.refs) {
			let value = data.refs[ref];
			if (isObject(value) && 'refs' in value) {
				value = YZGenerator3.parseRollTable(value);
			}
			rt.set(ref, value);
		}
		return rt;
	}
}

YZGenerator3.VARIABLE_REGEX = /^\$\{\{\s?([a-z0-9-]+)\s?\}\}$/;

module.exports = YZGenerator3;