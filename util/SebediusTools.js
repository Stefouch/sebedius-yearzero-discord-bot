const fs = require('fs');
const db = require('../database/database');
const Util = require('./Util');
const RollTable = require('./RollTable');
const YZCrit = require('./YZCrit');
// const Discord = require('discord.js');

/**
 * It's a collection of functions for Sebedius.
 */
module.exports = {
	/**
	 * Gets a YZ table.
	 * @param {string} path Folder path to the file without the `/` ending
	 * @param {string} fileName Filename without path, ext or lang-ext
	 * @param {?string} [lang='en'] The language to use, default is `en` English
	 * @param {?string} [ext='csv'] File extension
	 * @returns {RollTable}
	 */
	getTable(path, fileName, lang = 'en', ext = 'csv') {
		const pathName = `${path}/${fileName}`;
		let filePath = `${pathName}.${lang}.${ext}`;

		// If the language does not exist for this file, use the english default.
		if (!fs.existsSync(filePath)) filePath = `${pathName}.en.${ext}`;

		let elements;
		try {
			const fileContent = fs.readFileSync(filePath, 'utf8');
			elements = Util.csvToJSON(fileContent);
		}
		catch(error) {
			console.error(`[SebediusTools.getTable] - File Error: ${filePath}`);
			return null;
		}

		const table = new RollTable();
		for (const elem of elements) {
			const entry = new YZCrit(elem);
			table.set(entry.ref, entry);
		}
		table.name = `${fileName}.${lang}.${ext}`;

		return table;
	},
	/**
	 * Gets the game played (used for the dice icons set).
	 * @param {Discord.Message} message Discord message
	 * @param {Discord.Client} client Discord client (the bot)
	 * @param {?string} arg The word used to identify the game played
	 * @returns {string}
	 * @async
	 */
	async getGame(message, client, arg) {
		let game = client.config.supportedGames[0];
		if (client.config.supportedGames.includes(arg)) {
			game = arg;
		}
		// If no game was specified in the arguments, gets the default from the database.
		else if (message.channel.type === 'text') {
			const defaultGame = await db.get(message.guild.id, 'game');
			if (defaultGame) game = defaultGame;
		}
		return game;
	},
	/**
	 * Gets the language used.
	 * @param {Discord.Message} message Discord message
	 * @param {Discord.Client} client Discord client (the bot)
	 * @returns {string}
	 * @async
	 */
	async getLanguage(message, client) {
		let lang = client.config.supportedLangs[0];
		if (message.channel.type === 'text') {
			const defaultLang = await db.get(message.guild.id, 'lang');
			if (defaultLang) lang = defaultLang;
		}
		return lang;
	},
	/**
	 * Checks if the bot has all the required permissions.
	 * @param {Discord.Message} message Discord message
	 * @param {Discord.Client} client Discord client (the bot)
	 * @param {number} checkPerms Bitfield / Use this argument if you want to check just a few specific Permissions.
	 * @returns {boolean} `true` if the bot has all the required Permissions.
	 */
	checkPermissions(message, client, checkPerms = null) {
		const channel = message.channel;

		// Exits early if we are in a DM.
		if (channel.type === 'dm') return true;

		const botMember = channel.guild.me;
		const perms = checkPerms || client.config.perms.bitfield;
		const serverMissingPerms = botMember.permissions.missing(perms);
		const channelMissingPerms = channel.permissionsFor(botMember).missing(perms);

		// The above functions return an array
		// filled with the flag of the missing Permissions, if any.
		// If not, the arrays are empty (length = 0).
		if (serverMissingPerms.length || channelMissingPerms.length) {
			let msg = '🛑 **Missing Permissions!**'
				+ '\nThe bot does not have sufficient permission in this channel and will not work properly.'
				+ ' Check the Readme (`help`) for the list of required permissions.';
			if (serverMissingPerms.length) {
				msg += `\n**Role Missing Permission(s):** \`${serverMissingPerms.join('`, `')}\``;
			}
			if (channelMissingPerms.length) {
				msg += `\n**Channel Missing Permission(s):** \`${channelMissingPerms.join('`, `')}\``;
			}
			message.reply(msg);
			return false;
		}
		else {
			return true;
		}
	},
};