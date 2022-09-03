const { ActivityType } = require('discord.js');
const { random } = require('../utils/number-utils');
const Logger = require('../utils/logger');

const PLAYING_ACTIVITIES = [
  { name: '🌟 Coriolis', type: ActivityType.Playing },
  { name: '☢ Mutant Year Zero', type: ActivityType.Playing },
  { name: '🐭 GenLab Alpha', type: ActivityType.Playing },
  { name: '🤖 Mechatron', type: ActivityType.Playing },
  { name: '🎓 Elysium', type: ActivityType.Playing },
  { name: '🚀 Ad Astra', type: ActivityType.Playing },
  { name: '🐲 Forbidden Lands', type: ActivityType.Playing },
  { name: '❄ Bitter Reach', type: ActivityType.Playing },
  { name: '🏴‍☠️ Forbidden Pirates', type: ActivityType.Playing },
  { name: '🎒 Tales From The Loop', type: ActivityType.Playing },
  { name: '🎒 Things From The Flood', type: ActivityType.Playing },
  { name: '👾 Alien RPG', type: ActivityType.Playing },
  { name: '🦋 Vaesen', type: ActivityType.Playing },
  { name: '🐙 Cthulhu Year Zero', type: ActivityType.Playing },
  { name: '🪖 Twilight 2K', type: ActivityType.Playing },
  { name: '🦄 Blade Runner RPG', type: ActivityType.Playing },
];

const OTHER_ACTIVITIES = [
  { name: '🖤 Fria Ligan', type: ActivityType.Playing, url: 'https://www.frialigan.se/en' },
  { name: '🎲 Rolling sixes...', type: ActivityType.Playing },
  { name: '🎲 Rolling banes...', type: ActivityType.Playing },
  { name: '🎧 Mimir podcast', type: ActivityType.Listening },
  { name: '🎧 Noatun podcast', type: ActivityType.Listening },
  { name: '🎧 Elysium podcast', type: ActivityType.Listening },
  { name: 'Project E.D.E.N.', type: ActivityType.Watching },
  { name: 'Mutant: Undergångens', type: ActivityType.Playing },
  { name: 'Balladen om den vilsne vandraren', type: ActivityType.Listening, url: 'https://www.youtube.com/watch?v=yX1bcDumZBw' },
  { name: 'Mutant Year Zero: Road To Eden', type: ActivityType.Playing, url: 'https://www.mutantyearzero.com/' },
  { name: '📺 Alien³', type: ActivityType.Watching },
  { name: 'and building better worlds', type: ActivityType.Playing },
  { name: 'as a lurking Xenomorph', type: ActivityType.Playing },
  { name: 'with Tomas', type: ActivityType.Playing },
  { name: 'with NilsK', type: ActivityType.Playing },
  { name: 'and looking after Command Center Bravo', type: ActivityType.Playing, url: 'https://www.drivethrurpg.com/browse.php?author=Stefouch' },
];

const SPECIAL_ACTIVITIES = [
  // { name: '🎧 Mud & Blood', type: ActivityType.Listening },
  // { name: '🌿 Pitchfork', type: ActivityType.Playing },
  { name: '🎲 Year Zero Mini', type: ActivityType.Playing },
  { name: '🌃 Terminal State', type: ActivityType.Playing },
];

/**
 * Sets a loop interval for the bot's activities. Possible chances:
 *   * 50% - Playing YZ on XXX servers.
 *   * 30% - Playing activities (rpg).
 *   * 15% - Other activities.
 *   * 05% - Special activities.
 * @param {import('./sebedius-client')} client The bot's client
 * @param {number} [delay] The number of seconds to wait before calling the new activity
 * @returns {NodeJS.Timeout}
 */
module.exports = function (client, delay) {
  if (!delay) delay = client.config.activityLoopDelay;
  if (delay < 30) delay = 30;

  return setInterval(() => {
    let activity;
    const seed = Math.random();
    if (seed > 0.5) {
      activity = {
        name: `Year Zero on ${client.guilds.cache.size} servers`,
        type: ActivityType.Playing,
      };
    }
    else if (seed > 0.2) {
      activity = random(PLAYING_ACTIVITIES);
    }
    else if (seed > 0.05) {
      activity = random(OTHER_ACTIVITIES);
    }
    else {
      activity = random(SPECIAL_ACTIVITIES);
    }
    client.user.setActivity(activity);
    Logger.client(`Activity → ${activity.name}`);
  }, delay * 1000);
};
