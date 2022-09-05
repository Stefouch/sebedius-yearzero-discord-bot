const { existsSync, readFileSync } = require('node:fs');
const { parse: ymlParse } = require('yaml');
const { isObject } = require('../../utils/object-utils');
const { rand, isNumber, hasSameDigits, convertToBijective } = require('../../utils/number-utils');
const RollTable = require('../../utils/RollTable');
const Logger = require('../../utils/logger');

const GAMEDATA_PATH = './src/yearzero/gamedata';
const EXT = 'yml';

// /**
//  * @typedef RollTableData
//  * @property {string} name → RollTable.name
//  * @property {string} roll → RollTable.d
//  * @property {number}  <K, V>
//  * @property {string|string[]|RollTableData} [data.ref]
//  */

function parseGamedata(lang, fileName) {
  let filePath = `${GAMEDATA_PATH}/${lang}/${fileName}.${EXT}`;

  if (!existsSync(filePath)) {
    Logger.warn(`GamedataParser: Path Not Found! Using default...\nFile → ${filePath}`);
    filePath = `${GAMEDATA_PATH}/en/${fileName}.${EXT}`;
    if (!existsSync(filePath)) {
      throw new SyntaxError(`GamedataParserError: Resource Not Found!\nFile → ${filePath}`);
    }
  }

  const fileContent = readFileSync(filePath, { encoding: 'utf-8' });
  const data = ymlParse(fileContent);
}

/**
 * Parses a new RollTable from input data.
 * @param {Object} data
 */
function parseRollTable(data) {
  if (!_validateRollTable(data)) return data;
  const rollFn = _getRollTableRandomFunction(data.$roll);
  const table = new RollTable(rollFn);

  for (const [key, value] of Object.entries(data)) {
    if (isNumber(key)) {
      // if (isObject(value) && )
      table.set(+key, data[key]);
    }
  }
}

function _validateRollTable(data) {
  if (!isObject(data)) return false;
  return Object.keys(data).some(key => {
    const k = +key;
    if (typeof k === 'number' && !isNaN(k)) return true;
  });
}

function _getRollTableRandomFunction($roll) {
  if (!$roll) return null;
  const regex = /^(\d*)[dD](\d+)$/g;
  const exec = regex.exec($roll);
  const qty = +exec[1] || 1;
  const max = +exec[2];

  /** @type {() => number} */
  let fn;

  if (hasSameDigits(max)) {
    // Gets the actual Base. D66 = 6; D88 = 8;
    const digit = this.max % 10;
    // Creates sequence for the Base <digit>
    const seq = Array(digit).fill().map((x, n) => n + 1).join('');

    fn = () => {
      let result = 0;
      for (let i = 0; i < qty; i++) {
        let seed = rand(1, max);
        // Adjusts the seed.
        let log = Math.floor(Math.log10(max));
        for (; log > 0; log--) seed += digit ** log;
        // Converts the seed into a valid reference.
        result += +convertToBijective(seed, seq);
      }
      return result;
    };
  }
  else if (max) {
    fn = () => {
      let result = 0;
      for (let i = 0; i < qty; i++) result += rand(1, max);
      return result;
    };
  }
  return fn;
}

module.exports = { parseGamedata, parseRollTable };
