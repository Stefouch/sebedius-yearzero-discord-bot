const fs = require('fs');
const db = require('./database/database');
const Discord = require('discord.js');
const Util = require('./utils/Util');
const RollTable = require('./utils/RollTable');
const YZCrit = require('./yearzero/YZCrit');
const { SUPPORTED_GAMES, SUPPORTED_LANGS } = require('./utils/constants');

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
		this.combats = new Discord.Collection();

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
		return await Sebedius.getConf('games', 'game', message, this, SUPPORTED_GAMES[0]);
	}

	/**
	 * Gets the language desired (used for the tables).
	 * @param {Discord.Message} message Discord message
	 * @returns {string} two-letters code for the desired language
	 * @async
	 */
	async getLanguage(message) {
		return await Sebedius.getConf('langs', 'lang', message, this, SUPPORTED_LANGS[0]);
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
	 * Returns the selected choice, or None. Choices should be a list of two-tuples of (name, choice).
	 * If delete is True, will delete the selection message and the response.
	 * If length of choices is 1, will return the only choice unless force_select is True.
	 * @throws {Error} "NoSelectionElements" if len(choices) is 0.
	 * @throws {Error} "SelectionCancelled" if selection is cancelled.
	 */
	getSelection(message, choices, del = true, pm = false, text = null, forceSelect = false) {
		if (choices.length === 0) throw new Error('NoSelectionElements');
		else if (choices.length === 1 && !forceSelect) return choices[0][1];

		let page = 0;
		let pages;
	}

	/**
	 * Confirms whether a user wants to take an action.
	 * @param {Discord.Message} message The current message
	 * @param {string} text The message for the user to confirm
	 * @param {?boolean} [deleteMessages=false] Whether to delete the messages
	 * @returns {boolean|null} Whether the user confirmed or not. None if no reply was recieved
	 */
	static async confirm(message, text, deleteMessages = false) {
		const msg = await message.channel.send(text);
		const filter = m => m.author.id === message.author.id;
		const reply = await message.channel.awaitMessages(filter, { max: 1, time: 30000 });
		const replyBool = Util.getBoolean(reply.first().content) || null;
		if (deleteMessages) {
			try {
				await msg.delete();
				await reply.delete();
			}
			catch (error) { console.error(error); }
		}
		return replyBool;
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