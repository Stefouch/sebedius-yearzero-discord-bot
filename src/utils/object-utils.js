/**
 * A cheap data duplication trick which is relatively robust.
 * @param {Object} object 
 * @returns {Object} A copy of the object
 */
function duplicate(object) {
  return JSON.parse(JSON.stringify(object));
}

/* ------------------------------------------ */

/**
 * Searches through an object to retrieve a value by a string key.
 * The string key supports the notation a.b.c which would return object[a][b][c].
 * @param {Object}  o         The object to traverse
 * @param {string}  key       An object property with notation a.b.c
 * @param {number} [deep=100] Max callstack deep
 * @returns {*}
 */
function getProperty(o, key, deep = 100) {
  if (key in o) return o[key];
  if (deep <= 0) throw new RangeError('Maximum call stack size exceeded!');
  const keys = key.split('.');
  if (keys[0] in o) {
    return getProperty(o[keys[0]], key.slice(key.indexOf('.') + 1), --deep);
  }
  return;
}

/* ------------------------------------------ */

/**
 * Tests whether an object has a property or nested property given a string key.
 * The string key supports the notation a.b.c which would return true if object[a][b][c] exists.
 * @param {Object}  o         The object to traverse
 * @param {string}  key       An object property with notation a.b.c
 * @param {number} [deep=100] Max callstack deep
 * @returns {boolean}
 */
function hasProperty(o, key, deep = 100) {
  if (key in o) return true;
  if (deep <= 0) throw new RangeError('Maximum call stack size exceeded!');
  const keys = key.split('.');
  if (keys[0] in o) {
    return hasProperty(o[keys[0]], key.slice(key.indexOf('.') + 1), --deep);
  }
  return false;
}

/* ------------------------------------------ */

/**
 * Checks if an object **is** an Object.
 * Arrays and `null` are excluded.
 * @param {Object} o Object to analyze
 * @returns {boolean}
 */
function isObject(o) {
  if (!o) return false;
  if (Array.isArray(o)) return false;
  if (typeof o === 'object') return true;
  return false;
}

/* ------------------------------------------ */

/**
 * Checks if an object is empty.
 * @param {Object} o Object to test
 * @returns {boolean}
 */
function isObjectEmpty(o) {
  if (Object.getPrototypeOf(o) === Object.prototype) {
    if (Object.keys(o).length === 0) return true;
    return false;
  }
  return undefined;
}

/* ------------------------------------------ */

/**
 * Paginates an iterable.
 * @param {Array}  array An iterable
 * @param {number} n     The number of items per page
 * @returns {Array<Array>}
 */
function paginate(array, n) {
  const pages = [];
  const numPages = Math.ceil(array.length / n);
  for (let pg = 0; pg < numPages; pg++) {
    pages.push(
      array.slice(pg * n, (pg + 1) * n),
    );
  }
  return pages;
}

/* ------------------------------------------ */

/**
 * Pauses the Node process during the defined time.
 * @param {number} [ms=1000] Milliseconds to wait
 * @returns {Promise}
 */
function sleep(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ------------------------------------------ */

module.exports = {
  getProperty,
  hasProperty,
  isObject,
};
