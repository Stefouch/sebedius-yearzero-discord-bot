const { BitField } = require('discord.js');

/**
 * Data structure that makes it easy to interact with a TerrainTypes flags bitfield.
 * @extends {BitField}
 */
class YZTerrainTypesFlags extends BitField {
	/**
	 * Gets the modifiers that applies to the terrain.
	 * @type {YZTerrainTypesFlagsModifiers}
	 * @readonly
	 *
	 * @typedef {Object} YZTerrainTypesFlagsModifiers
	 * @property {string} movement Movement restrictions
	 * @property {number|string} hunt Hunting modifier
	 * @property {number|string} forage Foraging modifier
	 */
	get modifiers() {
		return this.toArray()
			.map(t => this.constructor.Modifiers[t])
			.reduce((sum, t) => {
				if(this.constructor.TERRAIN_MOVEMENTS[t.movement]
					> this.constructor.TERRAIN_MOVEMENTS[sum.movement]) {
					sum.movement = t.movement;
				}
				sum.forage += t.forage;
				sum.hunt += t.hunt;
				return sum;
			}, {
				movement: 'OPEN',
				forage: 0,
				hunt: 0,
			});
	}
}

/**
 * Numeric terrain type flags. All available properties:
 * * `PLAINS`
 * * `FOREST`
 * * `DARK_FOREST`
 * * `HILLS`
 * * `MOUNTAINS`
 * * `HIGH_MOUNTAINS`
 * * `LAKE`
 * * `RIVER`
 * * `MARSHLANDS`
 * * `QUAGMIRE`
 * * `RUINS`
 * * `TUNDRA`
 * * `ICE_CAP`
 * * `BENEATH_THE_ICE`
 * * `ICE_FOREST`
 * * `OCEAN`
 * * `SEA_ICE`
 */
YZTerrainTypesFlags.FLAGS = {
	PLAINS: 1 << 1,
	FOREST: 1 << 2,
	DARK_FOREST: 1 << 3,
	HILLS: 1 << 4,
	MOUNTAINS: 1 << 5,
	HIGH_MOUNTAINS: 1 << 6,
	LAKE: 1 << 7,
	RIVER: 1 << 8,
	MARSHLANDS: 1 << 9,
	QUAGMIRE: 1 << 10,
	RUINS: 1 << 11,
	TUNDRA: 1 << 12,
	ICE_CAP: 1 << 13,
	BENEATH_THE_ICE: 1 << 14,
	ICE_FOREST: 1 << 15,
	OCEAN: 1 << 16,
	SEA_ICE: 1 << 17,
};

/**
 * A list of modifiers for a Terrain.
 * @typedef {Object} TerrainModifier
 * @property {string} movement Movement restriction
 * @property {number} forage Foraging modifier
 * @property {number} hunt Hunting modifier
 */

/**
 * Terrain Modifiers.
 * @type {Object.<string, TerrainModifier}
 * @constant
 */
YZTerrainTypesFlags.Modifiers = {
	PLAINS: {
		movement: 'OPEN',
		forage: -1,
		hunt: +1,
	},
	FOREST: {
		movement: 'OPEN',
		forage: +1,
		hunt: +1,
	},
	DARK_FOREST: {
		movement: 'DIFFICULT',
		forage: -1,
		hunt: 0,
	},
	HILLS: {
		movement: 'OPEN',
		forage: 0,
		hunt: 0,
	},
	MOUNTAINS: {
		movement: 'DIFFICULT',
		forage: -2,
		hunt: -1,
	},
	HIGH_MOUNTAINS: {
		movement: 'IMPASSABLE',
		forage: NaN,
		hunt: NaN,
	},
	LAKE: {
		movement: 'REQUIRES_BOAT_OR_RAFT',
		forage: NaN,
		hunt: 0,
	},
	RIVER: {
		movement: 'REQUIRES_BOAT_OR_RAFT',
		forage: NaN,
		hunt: 0,
	},
	MARSHLANDS: {
		movement: 'REQUIRES_RAFT',
		forage: +1,
		hunt: -1,
	},
	QUAGMIRE:  {
		movement: 'DIFFICULT',
		forage: -1,
		hunt: 0,
	},
	RUINS:  {
		movement: 'DIFFICULT',
		forage: -2,
		hunt: -1,
	},
	TUNDRA: {
		movement: 'OPEN',
		forage: -1,
		hunt: +1,
	},
	ICE_CAP: {
		movement: 'OPEN',
		forage: NaN,
		hunt: -1,
	},
	BENEATH_THE_ICE: {
		movement: 'DIFFICULT',
		forage: NaN,
		hunt: NaN,
	},
	ICE_FOREST: {
		movement: 'DIFFICULT',
		forage: -1,
		hunt: 0,
	},
	OCEAN: {
		movement: 'REQUIRES_BOAT',
		forage: NaN,
		hunt: 0,
	},
	SEA_ICE: {
		movement: 'REQUIRES_BOAT',
		forage: NaN,
		hunt: 0,
	},
};

/**
 * Numeric terrain's movement restrictions.
 * @type {Object<string, number>}
 * @constant
 */
YZTerrainTypesFlags.TERRAIN_MOVEMENTS = {
	OPEN: 1,
	DIFFICULT: 2,
	REQUIRES_RAFT: 3,
	REQUIRES_BOAT_OR_RAFT: 4,
	REQUIRES_BOAT: 5,
	IMPASSABLE: 6,
};

module.exports = YZTerrainTypesFlags;