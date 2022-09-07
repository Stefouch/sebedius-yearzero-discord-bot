const { time, TimestampStyles } = require('discord.js');

function absoluteTimestamp(ms) {
  return time(Math.round(ms / 1000), TimestampStyles.ShortDateTime);
}

function relativeTimestamp(ms) {
  return time(Math.round(ms / 1000), TimestampStyles.RelativeTime);
}

function convertDate(ms) {
  return `${absoluteTimestamp(ms)} (${relativeTimestamp(ms)})`;
}

module.exports = {
  absoluteTimestamp,
  relativeTimestamp,
  convertDate,
};
