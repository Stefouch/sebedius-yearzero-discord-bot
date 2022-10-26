const YearZeroDie = require('../yearzero/roller/dice/yzdie');

/**
 * A class used to enrich text contents with replacement methods (called "enrichers").
 */
class TextEnricher {
  constructor() {
    /**
     * List of available enrichers.
     * @type {Enricher[]}
     */
    this.enrichers = [];

    this.#setDefaultEnrichers();
  }

  /* ------------------------------------------ */

  /**
   * Adds new enrichers
   * @param  {...Enricher} enrichers Enrichers to add
   * @private
   */
  _addEnrichers(...enrichers) {
    if (this.enrichers.length === 0) this.#setDefaultEnrichers();
    this.enrichers.push(...enrichers);
  }

  #setDefaultEnrichers() {
    this.enrichers = TextEnricher.DefaultEnrichers.slice();
  }

  /* ------------------------------------------ */
  /*  Text Enricher                             */
  /* ------------------------------------------ */

  /**
   * Enriches some text.
   * @param {string}   text     Text to enrich
   * @param {Object}  [options] Options to add to the enricher method
   * @param {boolean} [options.resultOnly] Whether to return only a numbered result (for roll enrichers).
   * @returns {Promise.<string>}
   */
  async enrichText(text, options = {}) {
    for (const { pattern, enricher } of this.enrichers) {
      text = text.replace(pattern, (...args) => enricher(args, options));
    }
    return text;
  }
}

/**
 * @type {Enricher[]}
 */
TextEnricher.DefaultEnrichers = [
  {
    pattern: /\[\[(\d?)[dD](\d+)\]\]/gm,
    enricher: rollEnricher,
  },
];

module.exports = TextEnricher;

/* ------------------------------------------ */
/*  Default Enrichers Callbacks               */
/* ------------------------------------------ */

/**
 * - $1: Number of dice
 * - $2: Face of the di·c·e
 * @param {string[]} match
 * @param {{ resultOnly: boolean }} [options]
 */
function rollEnricher(match, options) {
  const title = match[0].replace(/\[|\]/g, '');
  const qty = +match[1] || 1;
  const size = +match[2] || 6;
  let result = 0;
  for (let i = 0; i < qty; i++) {
    result += YearZeroDie.rng(1, size);
  }
  if (options.resultOnly) {
    return String(result);
  }
  // eslint-disable-next-line no-irregular-whitespace
  return `🎲 __${title}: **${result}**__`;
}

/* ------------------------------------------ */
/*  Types Definitions                         */
/* ------------------------------------------ */

/**
 * @typedef {Object} Enricher
 * @property {RegExp}           pattern
 * @property {EnricherCallback} enricher
 */

/**
 * @callback EnricherCallback
 * @param {string[]} match
 * @param {Object}  [options]
 * @returns {string}
 */
