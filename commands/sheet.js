const fs = require('fs');
const Discord = require('discord.js');
const Config = require('../config.json');

module.exports = {
	name: 'sheet',
	description: 'Shows your character sheet. Available options are:'
		+ '\n`-n|--name charactername` – Shows one specific character sheet. Only for the GM.',
	aliases: [ 'player', 'charactersheet'],
	guildOnly: false,
	args: false,
	usage: '[options]',
	execute(args, message) {
		// Lists the members of the current guild.
		if (args.includes('-m')) {
			let membersListText = '';
			const members = message.guild.members;

			members.forEach(member => {
				membersListText += `* User: ${member.user.username} (${member.user.id})\n`;
			});
			console.log(membersListText);
			message.author.send('__List of guild members__\n' + membersListText);

			return;
		}

		// Loads the available character sheets.
		const players = new Discord.Collection();
		const sheetFiles = fs.readdirSync('./sheets').filter(file => file.endsWith('.charactersheet.json'));

		for (const file of sheetFiles) {
			const player = require('../sheets/' + file);
			players.set(player.id, player);
		}

		// Finds the player's ID.
		let playerID = 0;
		const index = args.regIndexOf(/^(-n|--name)$/i);
		const nameToSearch = args[index + 1];

		if (index >= 0 && typeof nameToSearch !== 'undefined' && message.author.id === Config.gm.id) {
			const pl = players.find('pseudo', nameToSearch) || players.find('name', nameToSearch);

			if (pl) {
				playerID = pl.id;
			}
			else {
				playerID = message.author.id;
				message.reply('There are no character sheets with this reference.');
			}
		}
		else {
			playerID = message.author.id;
		}

		// Exits early if no there is no character sheet with this name.
		if (!players.get(playerID)) {
			message.reply('I\'m sorry, I didn\'t find the character sheet.');
			return;
		}

		// Finds the player's character sheet and gets the embed.
		const mySheet = players.get(playerID);
		const embedSheet = getCharacterSheetEmbed(mySheet);

		// Sends a message with the details.
		if (args.regIndexOf(/^(-pm|-dm|--private)$/i) >= 0) {
			message.author.send({ embed: embedSheet });
		}
		else {
			message.channel.send({ embed: embedSheet });
		}
	},
};

/**
 * Gets an Embed for the Character Sheet.
 * @param {Object} player
 * @returns {Discord.RichEmbed} A Discord Embed
 */
function getCharacterSheetEmbed(player) {
	return {
		color: 0x8888FF,
		title: `📜 CHARACTER SHEET: **${player.pseudo}** (${player.name})`,
		// url: 'https://discord.js.org',
		/* author: {
			name: 'Some name',
			icon_url: 'https://i.imgur.com/wSTFkRM.png',
			url: 'https://discord.js.org',
		}, */
		description: `${player.role}, ${(player.gender === 'M') ? 'Male' : 'Female'} ${player.kin}`,
		/* thumbnail: {
			url: 'https://i.imgur.com/wSTFkRM.png',
		}, */
		fields: [
			{
				name: 'Attributes',
				value: getStatsParsed(player.attributes, player.traumas, player.conditions, player.crits),
			},
			/* {
				name: '\u200b',
				value: '\u200b',
			}, */
			{
				name: 'Skills',
				value: getSkillsParsed(player.skills),
				inline: true,
			},
			{
				name: 'Mutations',
				value: player.mutations.join('\n') + `\nMP: **${player.mana.mutation}**`,
				inline: true,
			},
			{
				name: 'Talents',
				value: player.talents.join('\n'),
				inline: true,
			},
			{
				name: 'Gear',
				value: getGearParsed(player.gear, player.attributes.strength * 2),
			},
			{
				name: 'Weapons',
				value: getWeaponsParsed(player.weapons),
			},
			{
				name: 'Armors',
				value: getArmorsParsed(player.armors),
				inline: true,
			},
			{
				name: '\u200b',
				value: `Rot Points: **${player.rot}** (${player.permanentRot} perma)\nExperience Points Left: ${player.xp} XP`,
			},
		],
		/* image: {
			url: 'https://i.imgur.com/wSTFkRM.png',
		}, */
		timestamp: new Date(),
		footer: {
			text: player.update,
			// icon_url: 'https://i.imgur.com/wSTFkRM.png',
		},
	};
}

/**
 * Gets the stats details.
 * @param {Object} attr The Characer's attributes
 * @param {Object} traumas The Characer's traumas
 * @param {Object} conditions The Characer's health conditions
 * @param {Array<string>} crits The Characer's list of critical injuries
 * @returns {string} Detailed text
 */
function getStatsParsed(attr, traumas, conditions, crits) {
	let text = '';
	const conds = {
		strength: 'damage',
		agility: 'fatigue',
		wits: 'confusion',
		empathy: 'doubt',
	};

	// Generates the text for attributes, minus traumas.
	for (const key in attr) {
		const traumaVal = traumas[conds[key]];
		text += key.slice(0, 3).toUpperCase() + ' ';

		if (traumaVal > 0) {
			text += `**${attr[key] - traumaVal}** (${attr[key]})`;
		}
		else {
			text += `**${attr[key]}**`;
		}

		if (key !== 'empathy') {
			text += ', ';
		}
	}

	// Generates the text for health conditions.
	let conditionsText = '';

	for (const key in conditions) {

		if (conditions[key]) {

			if (conditionsText.length > 0) {
				conditionsText += ', ';
			}
			conditionsText += `**${key.toUpperCase()}**`;
		}
	}

	if (conditionsText.length > 0) {
		text += `\n${conditionsText}`;
	}

	// Generates the text for critical injuries.
	let critsText = '';

	for (const crit of crits) {
		critsText += `• ${crit}\n`;
	}

	if (critsText.length > 0) {
		text += `\n**Critical Injuries:**\n${critsText}`;
	}

	return text;
}

/**
 * Gets the skills details.
 * @param {Object} skills The list of skills
 * @returns {string} Detailed text
 */
function getSkillsParsed(skills) {
	let text = '';

	for (const key in skills) {
		const val = skills[key];
		if (val > 0) {
			const skillTitle = key.replace(/([A-Z])/g, ' $1');
			const skillName = skillTitle.charAt(0).toUpperCase() + skillTitle.slice(1);
			text += `${skillName}: **${val}**\n`;
		}
	}

	return text;
}

/**
 * Gets the gear details.
 * @param {Array<Array<string, number>>} gear An array of arrays with (0) item name & (1) item weight
 * @param {number} capacity The character's emcumbrance max capacity
 * @returns {string} Detailed text
 */
function getGearParsed(gear, capacity) {
	let text = '';
	let encumbrance = 0;

	// Items are {Arrays} with
	//   index 0 = item name
	//   index 1 = item weight
	for (const item of gear) {
		text += `- ${item[0]}\n`;
		encumbrance += item[1];
	}

	text += `Total Encumbrance: ${encumbrance}/${capacity}`;

	return text;
}

/**
 * Gets the weapons details.
 * @param {Object} weapons The character's weapons
 * @returns {string} Detailed text
 */
function getWeaponsParsed(weapons) {
	let text = '';

	for (const weapon of weapons) {
		text += `- ${weapon.name} (`;
		text += (weapon.bonus > 0) ? `**+${weapon.bonus}D**, ` : '';
		text += `damage **${weapon.damage}**, ${weapon.range} range`;
		text += (weapon.special.length) ? `, *${weapon.special}*` : '';
		text += ')\n';
	}

	return text;
}

/**
 * Gets the armors details.
 * @param {Object} armors The character's armors
 * @returns {string} Detailed text
 */
function getArmorsParsed(armors) {
	let text = '';
	let totalRating = 0;

	for (const armor of armors) {
		text += `- ${armor.name}\n`;
		totalRating += armor.rating;
	}

	text += `Total rating: **${totalRating}**`;

	return text;
}