const chalk = require('chalk');
const { zeroise } = require('./number-utils');

const format = '{timestamp} {tag} {msg}\n';

function error(msg) {
  return write({ msg, tag: 'ERROR', bgTagColor: 'bgRed', isError: true });
}

function warn(msg) {
  return write({ msg, tag: 'WARN', bgTagColor: 'bgYellow' });
}

function event(msg) {
  return write({ msg, tag: 'EVT', bgTagColor: 'bgGreen', isError: true });
}

function command(msg) {
  return write({ msg, tag: 'CMD', bgTagColor: 'bgMagenta' });
}

function client(msg) {
  return write({ msg, tag: 'CLIENT', bgTagColor: 'bgBlue' });
}

/**
 * @typedef {Object} TagOptions
 * @property {string}   msg
 * @property {string}   tag
 * @property {string}  [tagColor='black']
 * @property {string}   bgTagColor
 * @property {boolean} [isError=false]
 */

/**
 * @param {TagOptions} options
 * @private
 */
function write({ msg, tag, tagColor = 'black', bgTagColor, isError = false }) {
  // Timestamp
  const date = new Date();
  const YYYY = date.getFullYear();
  const MM = zeroise(date.getMonth() + 1);
  const DD = zeroise(date.getDay());
  const hh = zeroise(date.getHours());
  const mm = zeroise(date.getMinutes());
  const ss = zeroise(date.getSeconds());
  const timestamp = `[${YYYY}-${MM}-${DD}  ${hh}:${mm}:${ss}]`;

  // Stream
  const stream = isError ? process.stderr : process.stdout;

  // Format
  const content = format
    .replace('{timestamp}', chalk.gray(timestamp))
    .replace('{tag}', chalk[bgTagColor][tagColor](`[${tag}]`))
    .replace('{msg}', chalk.white(msg));

  // Write
  stream.write(content);
}

module.exports = {
  client,
  command,
  error,
  event,
  warn,
};
