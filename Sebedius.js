const fs = require('fs');
const db = require('./database/database');
const Util = require('./utils/Util');
const RollTable = require('./utils/RollTable');
const YZCrit = require('./yearzero/YZCrit');
const Discord = require('discord.js');

class Sebedius extends Discord.Client {

	constructor(config) {
		super();
		this.state = 'init';
		this.muted = false;
		this.config = config;
		this.commands = new Discord.Collection();
		this.addCommands();

		// Caching for the current session.
		this.prefixes = new Discord.Collection();
		this.games = new Discord.Collection();
		this.langs = new Discord.Collection();
		this.inits = new Discord.Collection();

		// Records commands statistics for the current session.
		this.counts = new Discord.Collection();
	}

	/**
	 * The bot's mention.
	 * @type {string} `<@0123456789>`
	 */
	get mention() {
		return Sebedius.getMention(this.user);
	}

	/**
	 * Creates the list of commands.
	 */
	addCommands() {
		const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

		for (const file of commandFiles) {
			const command = require('./commands/' + file);
			this.commands.set(command.name, command);
			console.log(`[+] - Command loaded: ${command.name}.js`);
		}
	}

	/**
	 * Gets the prefix for the server.
	 * @param {Discord.Message} message Discord message
	 * @returns {string}
	 * @async
	 */
	async getServerPrefix(message) {
		const prefixes = await this.getPrefixes(message);
		return prefixes[0];
	}

	/**
	 * Gets the list of prefixes in an array.
	 * @param {Discord.Message} message Discord message
	 * @param {?Discord.Client} client Discord client (the bot)
	 * @returns {string[]}
	 * @async
	 */
	async getPrefixes(message) {
		const fetchedPrefix = await Sebedius.getConf('prefixes', 'prefix', message, this, this.config.defaultPrefix);
		return whenMentionedOrPrefixed(fetchedPrefix, this);
	}

	/**
	 * Gets the desired game (used for the dice icons skin).
	 * @param {Discord.Message} message Discord message
	 * @returns {string}
	 * @async
	 */
	async getGame(message) {
		return await Sebedius.getConf('games', 'game', message, this, this.config.supportedGames[0]);
	}

	/**
	 * Gets the language desired (used for the tables).
	 * @param {Discord.Message} message Discord message
	 * @returns {string} two-letters code for the desired language
	 * @async
	 */
	async getLanguage(message) {
		return await Sebedius.getConf('langs', 'lang', message, this, this.config.supportedLangs[0]);
	}

	/**
	 * Gets an item from a Collection tied to a Sebedius client.
	 * @param {string} collectionName Name of the Collection
	 * @param {string} dbNamespace Namespace for the database
	 * @param {Discord.Message} message Discord message
	 * @param {Discord.Client} client Discord client (the bot)
	 * @param {?*} [defaultItem=null] The default item returned if nothing found.
	 * @returns {*}
	 * @throws {SebediusError} If the collection doesn't exist.
	 * @static
	 * @async
	 */
	static async getConf(collectionName, dbNamespace, message, client, defaultItem = null) {
		if (!message.guild) return defaultItem;
		if (!client[collectionName]) throw new SebediusError(`Collection-property unknown: ${collectionName}`);

		const guildID = message.guild.id;
		let fetchedItem;
		// Checks if already cached.
		if (client[collectionName].has(guildID)) {
			fetchedItem = client[collectionName].get(guildID);
		}
		// Otherwise, loads from db and cache.
		else {
			fetchedItem = await db.get(guildID, dbNamespace);
			if (!fetchedItem) fetchedItem = defaultItem;
			client[collectionName].set(guildID, fetchedItem);
		}
		// Returns the fetched prefixes.
		return fetchedItem;
	}

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
			console.error(`[Sebedius.getTable] - File Error: ${filePath}`);
			return null;
		}

		const table = new RollTable();
		for (const elem of elements) {
			const entry = new YZCrit(elem);
			table.set(entry.ref, entry);
		}
		table.name = `${fileName}.${lang}.${ext}`;

		return table;
	}

	/**
	 * Increases by 1 the number of uses for this command.
	 * Used for statistics purposes.
	 * @param {string} commandName The command.name property
	 */
	async raiseCommandStats(commandName) {
		let count = 1;
		if (this.counts.has(commandName)) count += this.counts.get(commandName);
		this.counts.set(commandName, count);
	}

	/**
	 * Checks if the bot has all the required permissions.
	 * @param {Discord.Message} message Discord message
	 * @param {Discord.Client} client Discord client (the bot)
	 * @param {number} checkPerms Bitfield / Use this argument if you want to check just a few specific Permissions.
	 * @returns {boolean} `true` if the bot has all the required Permissions.
	 * @static
	 */
	static checkPermissions(message, client, checkPerms = null) {
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
	}

	/**
	 * Gets a user from its mention.
	 * @param {string} mention The user mention
	 * @param {Discord.Client} client The Discord client (the bot)
	 * @returns {Discord.User}
	 * @static
	 */
	static getUserFromMention(mention, client) {
		// The id is the first and only match found by the RegEx.
		const matches = mention.match(/^<@!?(\d+)>$/);

		// If supplied variable was not a mention, matches will be null instead of an array.
		if (!matches) return;

		// However the first element in the matches array will be the entire mention, not just the ID,
		// so use index 1.
		const id = matches[1];

		return client.users.cache.get(id);
	}

	/**
	 * Gets the mention for this user
	 * @param {Discord.User} user Discord user
	 * @returns {string} In the form of `<@0123456789>`
	 * @static
	 */
	static getMention(user) {
		return `<@!${user.id}>`;
	}
}

function whenMentionedOrPrefixed(prefixes, client) {
	if (!Array.isArray(prefixes)) return whenMentionedOrPrefixed([prefixes], client);
	const mention = Sebedius.getMention(client.user);
	prefixes.push(mention);
	return prefixes;
}

module.exports = Sebedius;

class SebediusError extends Error {}