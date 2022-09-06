/**
 * Clamps a value to ensure it sits within a designated range.
 *
 * Called with no arguments, this function returns a value to fall
 * between 0 - 1, offering a useful shorthand for validating multipliers.
 *
 * @param {number} input Value to operate upon
 * @param {number} min   Lower threshold; defaults to 0
 * @param {number} max   Upper threshold; defaults to 1
 * @return {number}
 */
function clamp(input, min, max) {
  return Math.min(Math.max(input, min || 0), undefined === max ? 1 : max);
}

/* ------------------------------------------ */

/**
 * Gets the closest value.
 * @param {number}   needle   The goal value
 * @param {number[]} haystack The array to search
 * @returns {number}
 */
function closest(needle, haystack) {
  return haystack.reduce((a, b) => {
    return Math.abs(b - needle) < Math.abs(a - needle) ? b : a;
  });
}

/* ------------------------------------------ */

/**
 * Converts an integer to bijective (custom base) notation.
 * @param {number}  int                A positive integer above zero
 * @param {string} [sequence='123456'] Custom base (default is base-6)
 * @returns {string} The number's value expressed in bijective custom base
 */
function convertToBijective(int, sequence = '123456') {
  const length = sequence.length;

  if (int <= 0) return '' + int;
  if (int <= length) return sequence[int - 1];

  let index = (int % length) || length;
  const result = [sequence[index - 1]];

  while ((int = Math.floor((int - 1) / length)) > 0) {
    index = (int % length) || length;
    result.push(sequence[index - 1]);
  }

  return result.reverse().join('');
}

/* ------------------------------------------ */

/**
 * Returns the positivity of a string.
 * @param {string|*} str The string to test
 * @returns {boolean|null}
 */
function getBoolean(str) {
  if (typeof str === 'boolean') return str;
  if (str instanceof Boolean) return !!str;
  if (/(yes|y|true|t|1|enable|on)/i.test(str)) return true;
  if (/(no|n|false|f|0|disable|off)/i.test(str)) return false;
  return null;
}

/* ------------------------------------------ */

/**
 * Checks whether all the digits in a given number are the same or not.
 * @param {number} n Number to check
 * @returns {boolean}
 *
 * @example
 * hasSameDigits(1234);     // false
 * hasSameDigits(1111);     // true
 * hasSameDigits(22222222); // true
 */
function hasSameDigits(n) {
  const first = n % 10;
  while (n) {
    if (n % 10 !== first) return false;
    n = Math.floor(n / 10);
  }
  return true;
}

/* ------------------------------------------ */

/**
 * Checks if is a number.
 * @param {*} x Value to check
 * @returns {boolean}
 */
function isNumber(x) {
  if (typeof x === 'number') return true;
  if (/^0x[0-9a-f]+$/i.test(x)) return true;
  return (/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x));
}

/* ------------------------------------------ */

/**
 * Generates a random integer between [min, max] (included).
 * @param {number} min Minimum threshold
 * @param {number} max Maximum threshold
 * @returns {number} The randomized integer
 */
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/* ------------------------------------------ */

/**
 * Gets a random element from an iterable object, which can be:
 * * A string
 * * An Array
 * * A Set or Map object
 *
 * The object can also be non-iterable:
 * * A boolean: in this case, if it's true, it returns 0 or 1. If it's false, it always returns 0.
 * * A number: in this case, it returns a random integer between 0 and the given number non-included.
 *
 * @param {boolean|number|string|Array|Set|Map} data The iterable to randomize
 * @returns {*} An element chosen at random *(returns 'null' if found nothing)*
 */
function random(data) {
  if (typeof data === 'boolean') {
    if (data) return rand(0, 1);
    else return 0;
  }
  else if (typeof data === 'number') {
    return Math.floor(Math.random() * data);
  }
  else if (typeof data === 'string') {
    return data[Math.floor(Math.random() * data.length)];
  }
  else if (data instanceof Array) {
    return data[Math.floor(Math.random() * data.length)];
  }
  else if (data instanceof Set) {
    return [...data][Math.floor(Math.random() * data.size)];
  }
  else if (data instanceof Map) {
    const index = Math.floor(Math.random() * data.size);
    let cntr = 0;
    for (const key of data.keys()) {
      if (cntr++ === index) return data.get(key);
    }
  }
  return null;
}

/* ------------------------------------------ */

/**
 * Generates a string of random alphanumeric characters.
 * @param {number} [length=4] Number of characters to return
 * @returns {string}
 */
function randomID(length = 4) {
  return Math.random().toString(36).substr(2, (length || 4) + 2);
}

/* ------------------------------------------ */

/**
* Creates an array of all integers between two numbers.
* @param {number} lowEnd Start value
* @param {number} highEnd End value
* @returns {number[]}
*/
function range(lowEnd, highEnd) {
  const nums = [];
  for (let i = lowEnd; i <= highEnd; i++) {
    nums.push(i);
  }
  return nums;
}

/* ------------------------------------------ */

/**
* Resolves a string resolvable number.
* @param {string} n Resolvable stringified number
* @returns {number}
*/
function resolveNumber(n) {
  if (typeof n === 'number') return n;
  if (isNumber(n)) return +n;
  const regex = /(\d+)/;
  if (typeof n === 'string' && regex.test(n)) {
    return +regex.exec(n)[0];
  }
  return NaN;
}

/* ------------------------------------------ */

/**
 * Adds leading zeros when necessary.
 * @param {number}  value  The number being formatted
 * @param {number} [min=2] The minimum required length of the formatted number
 * @returns {string}
 */
function zeroise(value, min = 2) {
  return `${value}`.padStart(min, '0');
}

/* ------------------------------------------ */

module.exports = {
  clamp,
  // closest,
  convertToBijective,
  // getBoolean,
  hasSameDigits,
  isNumber,
  rand,
  random,
  randomID,
  // range,
  resolveNumber,
  zeroise,
};
