const { existsSync, readFileSync } = require('node:fs');
const { parse: ymlParse } = require('yaml');
const { isObject } = require('../../utils/object-utils');
const { isNumber } = require('../../utils/number-utils');
const RollTable = require('../../utils/RollTable');
const Logger = require('../../utils/logger');

const GAMEDATA_PATH = './src/yearzero/gamedata';
const EXT = 'yml';

function parseGamedata(lang, fileName) {
  let filePath = `${GAMEDATA_PATH}/${lang}/${fileName}.${EXT}`;

  if (!existsSync(filePath)) {
    Logger.warn(`"${filePath}" → GamedataParser: Path Not Found! Using default...`);
    filePath = filePath.replace(`/${lang}/`, '/en-US/');
    if (!existsSync(filePath)) {
      throw new SyntaxError(`GamedataParserError: Resource Not Found!\nFile → ${filePath}`);
    }
  }

  const fileContent = readFileSync(filePath, { encoding: 'utf-8' });
  const data = ymlParse(fileContent);

  if (_validateRollTable(data)) return parseRollTable(data);
  else return data;
}

/**
 * Parses a new RollTable from input data.
 * @param {Object} data
 * @param {number} [depth=100]
 */
function parseRollTable(data, depth = 100) {
  if (depth < 0) {
    throw new RangeError('GamedataParserError: Maximum Call Stack Depth Exceeded!');
  }
  const table = new RollTable(data._name, data._roll);

  for (const [key, value] of Object.entries(data)) {
    if (_validateRollTable(value)) {
      const tbl = parseRollTable(value, --depth);
      table.set(+key, tbl, false);
    }
    else if (isNumber(key)) {
      table.set(key, data[key], false);
    }
  }
  return table.sort();
}

function _validateRollTable(data) {
  if (!isObject(data)) return false;
  return ('_roll' in data) && Object.keys(data).some(key => {
    const k = +key;
    if (typeof k === 'number' && !isNaN(k)) return true;
  });
}

module.exports = { parseGamedata, parseRollTable };
