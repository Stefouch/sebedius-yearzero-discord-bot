const { time, TimestampStyles } = require('discord.js');

function absoluteTimestamp(ms) {
  return time(Math.round(ms / 1000), TimestampStyles.ShortDateTime);
}

function relativeTimestamp(ms) {
  return time(Math.round(ms / 1000), TimestampStyles.RelativeTime);
}

module.exports = {
  absoluteTimestamp,
  relativeTimestamp,
};
