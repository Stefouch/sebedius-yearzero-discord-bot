const { random } = require('./Util');

const PLAYING_ACTIVITIES = [
	{ name: '🌟 Coriolis', type: 'PLAYING' },
	{ name: '☢ Mutant Year Zero', type: 'PLAYING' },
	{ name: '🐭 GenLab Alpha', type: 'PLAYING' },
	{ name: '🤖 Mechatron', type: 'PLAYING' },
	{ name: '🎓 Elysium', type: 'PLAYING' },
	{ name: '🚀 Ad Astra', type: 'PLAYING' },
	{ name: '🐲 Forbidden Lands', type: 'PLAYING' },
	{ name: '❄ Bitter Reach', type: 'PLAYING' },
	{ name: '🏴‍☠️ Forbidden Pirates', type: 'PLAYING' },
	{ name: '🎒 Tales From The Loop', type: 'PLAYING' },
	{ name: '🎒 Things From The Flood', type: 'PLAYING' },
	{ name: '👾 ALIEN rpg', type: 'PLAYING' },
	{ name: '🦋 Vaesen', type: 'PLAYING' },
	{ name: '🐙 Cthulhu Year Zero', type: 'PLAYING' },
	{ name: '🔫 Twilight Year 2K', type: 'PLAYING' },
];

const OTHER_ACTIVITIES = [
	{ name: '🖤 Fria Ligan', type: 'PLAYING' },
	{ name: '🎲 Rolling sixes...', type: 'PLAYING' },
	{ name: '🎲 Rolling banes...', type: 'PLAYING' },
	{ name: '🎧 Mimir podcast', type: 'LISTENING' },
	{ name: '🎧 Noatun podcast', type: 'LISTENING' },
	{ name: '🎧 Elysium podcast', type: 'LISTENING' },
	{ name: 'Project E.D.E.N.', type: 'WATCHING' },
	{ name: 'Mutant: Undergångens', type: 'PLAYING' },
	{ name: 'Balladen om den vilsne vandraren', type: 'LISTENING' },
	{ name: '🐗 Road To Eden', type: 'PLAYING' },
	{ name: '📺 Alien³', type: 'WATCHING' },
];

const SPECIAL_ACTIVITIES = [
	{ name: 'and building better worlds', type: 'PLAYING' },
	{ name: 'as a lurking Xenomorph', type: 'PLAYING' },
	{ name: 'with Tomas as the GM', type: 'PLAYING' },
	{ name: 'and looking for Command Center Bravo', type: 'PLAYING' },
	{ name: '🎧 Mud&Blood', type: 'LISTENING' },
	{ name: '🌿 Pitchfork', type: 'PLAYING' },
	{ name: '🎲 Year Zero Mini', type: 'PLAYING' },
	{ name: '🌃 Terminal State', type: 'PLAYING' },
];

/**
 * Sets a loop interval for the bot's activities. Possible chances:
 *   * 50% - Playing YZ on XXX servers.
 *   * 30% - Playing activities (rpg).
 *   * 15% - Other activities.
 *   * 05% - Special activities.
 * @param {Discord.Client} bot The bot's client
 * @param {?number} delay The number of seconds to wait before calling the new activity
 * @returns {NodeJS.Timeout}
 */
module.exports = function(bot, delay = null) {
	if (!delay) delay = bot.config.activityLoopDelay;
	if (delay < 30) delay = 30;

	return setInterval(() => {
		const seed = Math.random();
		if (seed > 0.5) {
			bot.user.setActivity({
				name: `RPGs on ${bot.guilds.cache.size} servers`,
				type: 'PLAYING',
			});
		}
		else if (seed > 0.2) {
			bot.user.setActivity(random(PLAYING_ACTIVITIES));
		}
		else if (seed > 0.05) {
			bot.user.setActivity(random(OTHER_ACTIVITIES));
		}
		else {
			bot.user.setActivity(random(SPECIAL_ACTIVITIES));
		}
	}, delay * 1000);
};