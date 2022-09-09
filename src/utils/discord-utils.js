const { time, TimestampStyles } = require('discord.js');

/**
 * @param {number} ms
 * @returns 
 */
function absoluteTimestamp(ms) {
  return time(Math.round(ms / 1000), TimestampStyles.ShortDateTime);
}

function relativeTimestamp(ms) {
  return time(Math.round(ms / 1000), TimestampStyles.RelativeTime);
}

function convertDate(ms) {
  return `${absoluteTimestamp(ms)} (${relativeTimestamp(ms)})`;
}

/**
 * Sleeps the process.
 * @param {number} ms Milliseconds to sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  absoluteTimestamp,
  relativeTimestamp,
  convertDate,
  sleep,
};
