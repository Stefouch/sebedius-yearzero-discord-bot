class YZThreat {
	/**
	 * Defines a Threat.
	 * @param {Object} data Threat's props
	 */
	constructor(data) {
		Object.defineProperty(this, Symbol('id'), {
			value: Math.floor(Math.random() * Date.now()),
		});
		this.name = data.name || null;
		this.description = data.description || null;
		this.ktzMalus = data.ktzMalus || 0;
		this.attributes = data.attributes || {};
		this.skills = data.skills || {};
		this.gear = data.gear || null;
	}
}

module.exports = YZThreat;