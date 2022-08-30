const chalk = require('chalk');
const { zeroise } = require('./number-utils');

const format = '{timestamp} {tag} {msg}\n';

function error(msg) {
  return write({ msg, msgColor: 'red', tag: 'ERROR', bgTagColor: 'bgRed', isError: true });
}

function warn(msg) {
  return write({ msg, msgColor: 'yellow', tag: 'WARN', bgTagColor: 'bgYellow' });
}

function info(msg) {
  return write({ msg, tag: 'INFO', bgTagColor: 'bgBlueBright' });
}

function event(msg) {
  return write({ msg, msgColor: 'magenta', tag: 'EVENT', bgTagColor: 'bgMagenta' });
}

function command(msg) {
  return write({ msg, msgColor: 'cyan', tag: 'COMMAND', bgTagColor: 'bgCyan' });
}

function client(msg) {
  return write({ msg, tag: 'CLIENT', bgTagColor: 'bgBlue' });
}

function roll(r) {
  return write({ msg: r.toString(), tag: '🎲ROLL ', bgTagColor: 'bgCyan' });
}

/**
 * @typedef {Object} ConsoleOptions
 * @property {string|Error} msg
 * @property {string}      [msgColor='white']
 * @property {string}       tag
 * @property {string}      [tagColor='white']
 * @property {string}      [bgTagColor]
 * @property {boolean}     [isError=false]
 */

/**
 * @param {ConsoleOptions} options
 * @private
 */
function write({
  msg,
  msgColor = 'white',
  tag,
  tagColor = 'white',
  bgTagColor = 'black',
  isError = false,
}) {
  // Timestamp
  const date = new Date();
  const YYYY = date.getFullYear();
  const MM = zeroise(date.getMonth() + 1);
  const DD = zeroise(date.getDay());
  const hh = zeroise(date.getHours());
  const mm = zeroise(date.getMinutes());
  const ss = zeroise(date.getSeconds());
  const timestamp = `[${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}]`;

  // Tag
  const logTag = ` ${tag} `;

  // Stream
  const stream = isError ? process.stderr : process.stdout;

  // Format
  const content = format
    .replace('{timestamp}', chalk.gray(timestamp))
    .replace(
      '{tag}',
      bgTagColor ? chalk[bgTagColor][tagColor](logTag) : chalk[tagColor](logTag))
    .replace('{msg}', chalk[msgColor](msg));

  // Write
  stream.write(content);

  // If Error
  if (msg instanceof Error) {
    console.error(msg);
  }
}

module.exports = {
  client,
  command,
  error,
  event,
  info,
  roll,
  warn,
};
