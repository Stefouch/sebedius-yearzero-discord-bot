const fs = require('fs');
const db = require('../database/database');
const Util = require('./Util');
const RollTable = require('./RollTable');
const YZCrit = require('./YZCrit');

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
	 * @param {string} arg The phrase (one word) used to identify the game played
	 * @param {Discord.Message} message Discord message
	 * @param {Discord.Client} client Discord client (the bot)
	 * @returns {string}
	 * @async
	 */
	async getGame(arg, message, client) {
		let game;
		if (client.config.supportedGames.includes(arg)) {
			game = arg;
		}
		// If no game was specified in the arguments, gets the default from the database.
		else if (message.channel.type !== 'dm') {
			const defaultGame = await db.get(message.guild.id, 'game');
			if (defaultGame) game = defaultGame;
		}
		else {
			game = client.config.supportedGames[0];
		}
		return game;
	},
};