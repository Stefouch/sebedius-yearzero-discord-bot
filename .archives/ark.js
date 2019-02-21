// const Config = require('../config.json');
const ark = require('../sheets/ark.json');

/**
 * Capitalizes the first letter of a String.
 */
String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

module.exports = {
	name: 'ark',
	description: 'Returns the Ark Sheet',
	aliases: ['a'],
	guildOnly: false,
	args: false,
	usage: '',
	execute(args, message) {
		message.channel.send({ embed: getArkSheetEmbed() });
	},
};

/**
 * Gets an Embed for the Ark Sheet.
 * @returns {Discord.Embed} A Discord Embed
 */
function getArkSheetEmbed() {
	return {
		color: 0x8888FF,
		title: `🚩 ARK SHEET: **${ark.name.toUpperCase()}**`,
		description: `${ark.loc}`,
		fields: [
			{
				name: 'Bosses',
				value: ark.bosses.join(', '),
			},
			{
				name: 'Population',
				value: `${ark.pop.current} / ${ark.pop.starting}`,
			},
			{
				name: 'DEV Levels',
				value: getDEVParsed(),
				inline: true,
			},
			{
				name: 'Running Projects',
				value: getProjectsParsed(),
				inline: true,
			},
			{
				name: 'Completed Projects',
				value: getProjectsParsed(true),
				inline: true,
			},
		],
		timestamp: new Date(),
		footer: {
			text: ark.update,
		},
	};
}

/**
 * Gets the Ark's DEV Levels details.
 * @returns {string} Detailed text
 */
function getDEVParsed() {
	let text = '';
	const icons = {
		food: '🍏',
		culture: '📚',
		tech: '🔬',
		warfare: '⚔',
		battle: '💥',
	};

	for (const dev in ark.dev) {
		text += `\n${icons[dev]} • ${dev.capitalize()}: **${ark.dev[dev]}**`;
	}

	return text;
}

/**
 * Gets the Ark's Projects details.
 * Projects are {Array} with [{string} name, {number} progress, {number} final].
 * @param {boolean} completedOnly To return only completed projects
 * @returns {string} Detailed text
 */
function getProjectsParsed(completedOnly = false) {
	let text = '';

	// Project = {Array<string, number, number>}
	//   (0) = {string} project's name
	//   (1) = {number} progress
	//   (2) = {number} final
	for (const proj of ark.projects) {

		if (proj[1] === proj[2]) {
			text += (completedOnly) ? `\n• ${proj[0]}` : '';
		}
		else {
			text += (completedOnly) ? '' : `\n• ${proj[0]}: ${proj[1]}/${proj[2]}`;
		}
	}

	// Avoids empty return (which triggers an exception).
	if (text.length <= 0) {
		text += '*(none)*';
	}

	return text;
}