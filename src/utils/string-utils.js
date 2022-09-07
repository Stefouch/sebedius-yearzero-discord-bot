/**
 * Capitalizes the first letter of a string.
 * @param {string} str The string to process
 * @returns {string} The processed string
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ------------------------------------------ */

/**
 * Capitalizes the first letter of every word in a string.
 * @param {string} str The string to process
 * @returns {string} The processed string
 */
function capitalizeWords(str) {
  return str.replace(/(^|\s)\S/g, l => l.toUpperCase());
}

/* ------------------------------------------ */

/**
 * Lowers the first character of a string.
 * @param {string} str The string to process
 * @returns {string} The processed string
 */
function strLcFirst(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/* ------------------------------------------ */

/**
 * Transforms a camelCase string into a normal one with spaces.
 * @param {string} str The string to process
 * @returns {string} The processed string
 */
function strCamelToNorm(str) {
  str = str.replace(/([A-Z])/g, ' $1');
  return capitalize(str);
}

/* ------------------------------------------ */

/**
 * Converts a normal string into a kebab-cased-string.
 * @param {string} str The string to process
 * @returns {string}
 */
function strToKebab(str) {
  return str.toLowerCase().replace(/ /g, '-');
}

/* ------------------------------------------ */

/**
 * Converts kebab-cased-string into a normal string.
 * @param {string} str The string to process
 * @returns {string}
 */
function kebabToStrUcFirst(str) {
  return str
    .split('-')
    .map(s => capitalize(s))
    .join(' ');
}

/* ------------------------------------------ */

/**
 * Converts a kebab-cased-string into a camelCasedString.
 * @param {string} input
 * @returns {string}
 */
function kebabToCamelCase(input) {
  return input.toLowerCase().replace(/([a-z])-+([a-z])/g, function (match, a, b) {
    return a + b.toUpperCase();
  });
}

/* ------------------------------------------ */

/**
 * Converts a camelCased string to its kebab-cased equivalent.
 * Hilariously-named function entirely coincidental.
 * @param {string} string camelCasedStringToConvert
 * @returns {string} input-string-served-in-kebab-form
 */
function camelToKebabCase(string) {
  // Don't bother trying to transform a string that isn't well-formed camelCase.
  if (!/^([a-z]+[A-Z])+[a-z]+$/.test(string)) return string;

  return string.replace(/([a-z]+)([A-Z])/g, (match, before, after) => {
    return before + '-' + after;
  }).toLowerCase();
}

/* ------------------------------------------ */

/**
 * Returns a bubble string to represent a counter's value.
 * @param {number}  value
 * @param {number}  max
 * @param {boolean} fillFromRight
 * @returns {string}
 */
function bubbleFormat(value, max, fillFromRight = false) {
  if (max > 100) return `${value}/${max}`;
  const used = max - value;
  const filled = '\\🔘'.repeat(value);
  const empty = '\u3007'.repeat(used);
  if (fillFromRight) return empty + filled;
  return filled + empty;
}

/* ------------------------------------------ */

/**
 * Trims a string to a defined maximum length.
 * @param {string} text      The text to trim
 * @param {number} maxLength The maximum length the string can have
 * @returns {string}
 */
function trimString(text, maxLength) {
  if (text === undefined) return '';
  if (text.length < maxLength) return text;
  return `${text.slice(0, maxLength - 4)}...`;
}

/* ------------------------------------------ */

/**
 * Options for splitting a message.
 * @typedef {Object} SplitOptions
 * @property {number} [maxLength=2000] Maximum character length per message piece
 * @property {string|string[]|RegExp|RegExp[]} [char='\n'] Character(s) or Regex(es) to split the message with,
 *   an array can be used to split multiple times
 * @property {string} [prepend='']     Text to prepend to every piece except the first
 * @property {string} [append='']      Text to append to every piece except the last
 */

/**
 * Splits a string into multiple chunks at a designated character that do not exceed a specific length.
 * @param {string}        text     Content to split
 * @param {SplitOptions} [options] Options controlling the behavior of the split
 * @returns {string[]}
 */
function splitMessage(text, { maxLength = 2000, char = '\n', prepend = '', append = '' } = {}) {
  if (text.length <= maxLength) return [text];
  let splitText = [text];
  if (Array.isArray(char)) {
    while (char.length > 0 && splitText.some(elem => elem.length > maxLength)) {
      const currentChar = char.shift();
      if (currentChar instanceof RegExp) {
        splitText = splitText.flatMap(chunk => chunk.match(currentChar));
      }
      else {
        splitText = splitText.flatMap(chunk => chunk.split(currentChar));
      }
    }
  }
  else {
    splitText = text.split(char);
  }
  if (splitText.some(elem => elem.length > maxLength)) throw new RangeError('SPLIT_MAX_LEN');
  const messages = [];
  let msg = '';
  for (const chunk of splitText) {
    if (msg && (msg + char + chunk + append).length > maxLength) {
      messages.push(msg + append);
      msg = prepend;
    }
    msg += (msg && msg !== prepend ? char : '') + chunk;
  }
  return messages.concat(msg).filter(m => m);
}

/* ------------------------------------------ */

/**
 * Aligns a string by padding it with leading/trailing whitespace.
 * @param {string}  input
 * @param {number}  width     Character width of the container
 * @param {number} [axis=0.5] Multiplier specifying axis of alignment:
 * * 0.0: Left-aligned
 * * 0.5: Centred
 * * 1.0: Right-aligned
 * * The default is 0.5 (center-aligned).
 * @param {string} [char=' '] Character to pad with. Defaults to space (U+0020)
 * @returns {string}
 */
function alignText(input, width, axis, char) {
  axis = undefined === axis ? 0.5 : axis;
  char = char || ' ';
  const emptySpace = width - input.length;

  // Returns early if there's nothing to do here.
  if (emptySpace < 1) return input;

  const left = emptySpace * axis;
  const right = emptySpace - left;

  return char.repeat(Math.round(left)) + input + char.repeat(Math.round(right));
}

/* ------------------------------------------ */

/**
 * Wraps a string to a specified line length.
 *
 * Words are pushed onto the following line, unless they exceed the line's total length limit.
 *
 * @param {string}  input   Block of text to wrap
 * @param {number} [len=80] Number of characters permitted on each line.
 * @returns {string[]} An array of fold points, preserving any new-lines in the original text.
 */
function wordWrap(input, len) {
  const length = len || 80;
  const output = [];
  for (let i = 0, l = input.length; i < l; i += length) {
    let match, nl;
    let segment = input.substring(i, i + length);

    // Segment contains at least one newline.
    if ((nl = segment.lastIndexOf('\n')) !== -1) {
      output.push(segment.substring(0, nl + 1));
      segment = segment.substring(nl + 1);
    }

    // We're attempting to cut on a non-whitespace character. Do something.
    if (/\S/.test(input[(i + length) - 1]) && (match = segment.match(/\s(?=\S+$)/))) {
      output.push(segment.substr(0, i + length > l ? l : (match.index + 1)));
      i = (i - (match.input.length - match.index)) + 1;
    }
    else {
      output.push(segment);
    }
  }
  return output;
}

/* ------------------------------------------ */

/**
 * @typedef {string|Array|*} StringResolvable
 * Data that can be resolved to give a string. This can be:
 * * A string
 * * An array (joined with a new line delimiter to give a string)
 * * Any value
 */

/**
 * Resolves a StringResolvable to a string.
 * @param {StringResolvable} data The string resolvable to resolve
 * @returns {string}
 */
function resolveString(data) {
  if (typeof data === 'string') return data;
  if (data instanceof Array) return data.join(', ');
  return String(data);
}

module.exports = {
  capitalize,
  resolveString,
  trimString,
};
