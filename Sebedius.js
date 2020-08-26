const fs = require('fs');
const Keyv = require('keyv');
const Discord = require('discord.js');
const YZCrit = require('./yearzero/YZCrit');
const Util = require('./utils/Util');
const PageMenu = require('./utils/PageMenu');
const RollTable = require('./utils/RollTable');
const Errors = require('./utils/errors');
const { SUPPORTED_GAMES, DICE_ICONS, SOURCE_MAP } = require('./utils/constants');

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

class Sebedius extends Discord.Client {

	constructor(config) {
		// ClientOptions: https://discord.js.org/#/docs/main/master/typedef/ClientOptions
		super({
			messageCacheMaxSize: 100,
			messageCacheLifetime: 60 * 10,
			messageSweepInterval: 90,
			// partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
			ws: {
				// Intents: https://discordjs.guide/popular-topics/intents.html#the-intents-bit-field-wrapper
				intents: [
					'GUILDS',
					// 'GUILD_PRESENCES',
					// 'GUILD_MEMBERS',
					'GUILD_MESSAGES',
					'GUILD_MESSAGE_REACTIONS',
					'DIRECT_MESSAGES',
					'DIRECT_MESSAGE_REACTIONS',
				],
			},
		});
		this.state = 'init';
		this.muted = false;
		this.config = config;
		this.version = require('./utils/version').version;
		this.commands = new Discord.Collection();
		this.addCommands();

		// Caching for the current session.
		this.prefixes = new Discord.Collection();
		this.games = new Discord.Collection();
		this.langs = new Discord.Collection();
		this.combats = new Discord.Collection();

		// Keyv Databases.
		console.log('[+] - Keyv Databases');
		this.dbUri = process.env.NODE_ENV === 'production' ? process.env.DATABASE_URL : null;
		console.log('      > Creation...');
		this.kdb = {
			prefixes: new Keyv(this.dbUri, { namespace: 'prefix' }),
			initiatives: new Keyv(this.dbUri, { namespace: 'initiative' }),
			games: new Keyv(this.dbUri, { namespace: 'game' }),
			langs: new Keyv(this.dbUri, { namespace: 'lang' }),
			combats: new Keyv(this.dbUri, { namespace: 'combat' }),
			stats: new Keyv(this.dbUri, { namespace: 'count' }),
		};
		this.kdb.prefixes.on('error', err => console.error('Keyv Connection Error: prefixes', err));
		this.kdb.initiatives.on('error', err => console.error('Keyv Connection Error: initiatives', err));
		this.kdb.games.on('error', err => console.error('Keyv Connection Error: games', err));
		this.kdb.langs.on('error', err => console.error('Keyv Connection Error: langs', err));
		this.kdb.combats.on('error', err => console.error('Keyv Connection Error: combats', err));
		this.kdb.stats.on('error', err => console.error('Keyv Connection Error: stats', err));
		console.log('      > Loaded & Ready!');
	}

	async kdbEntries() {
		const entries = await this.kdb.combats.opts.store.query('SELECT * FROM keyv;');
		console.log(entries);
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
	 * @returns {string[]}
	 * @async
	 */
	async getPrefixes(message) {
		const fetchedPrefix = await Sebedius.getConf('prefixes', message, this, this.config.defaultPrefix);
		return whenMentionedOrPrefixed(fetchedPrefix, this);
	}

	/**
	 * Gets the desired game (used for the dice icons skin).
	 * @param {Discord.Message} message Discord message
	 * @param {?string} defaultGame Fallback default game
	 * @returns {string}
	 * @async
	 */
	async getGame(message, defaultGame = null) {
		const game = await Sebedius.getConf('games', message, this, defaultGame);
		if (!game) return await Sebedius.getGameFromSelection(message);
		return game;
	}

	/**
	 * Gets the desired game from a selection message.
	 * @param {Discord.Message} message Discord message
	 * @returns {string}
	 * @async
	 */
	static async getGameFromSelection(message) {
		const gameChoices = SUPPORTED_GAMES.map(g => [SOURCE_MAP[g], g]);
		return await Sebedius.getSelection(message, gameChoices);
	}

	/**
	 * Gets the language desired (used for the tables).
	 * @param {Discord.Message} message Discord message
	 * @returns {string} two-letters code for the desired language
	 * @async
	 */
	async getLanguage(message) {
		return await Sebedius.getConf('langs', message, this, 'en');
	}

	/**
	 * Gets the a Combat instance.
	 * @param {Discord.Message} message Discord message
	 * @returns {string} two-letters code for the desired language
	 * @async
	 */
	async getCombat(message) {
		return await Sebedius.getConf('combats', message.channel.id, this, null);
	}

	/**
	 * Gets an item from a Collection tied to a Sebedius client.
	 * @param {string} collectionName Name of the Collection
	 * @param {string} dbNamespace Namespace for the database
	 * @param {Discord.Message} message Discord message
	 * @param {Discord.Client} client Discord client (the bot)
	 * @param {?*} [defaultItem=null] The default item returned if nothing found.
	 * @throws {SebediusError} If the collection doesn't exist.
	 * @returns {*}
	 * @static
	 * @async
	 */
	static async getConf(collectionName, message, client, defaultItem = null) {
		if (!message.guild) return defaultItem;
		if (!client[collectionName]) throw new Errors.SebediusError(`Collection-property unknown: ${collectionName}`);

		const guildID = message.guild.id;
		let fetchedItem;
		// Checks if already cached.
		if (client[collectionName].has(guildID)) {
			fetchedItem = client[collectionName].get(guildID);
		}
		// Otherwise, loads from db and cache.
		else {
			fetchedItem = await client.kdb[collectionName].get(guildID);
			if (!fetchedItem) fetchedItem = defaultItem;
			if (fetchedItem) client[collectionName].set(guildID, fetchedItem);
		}
		// Returns the fetched prefixes.
		return fetchedItem;
	}

	/**
	 * Increases by 1 the number of uses for this command.
	 * Used for statistics purposes.
	 * @param {string} commandName The command.name property
	 * @returns {number}
	 * @async
	 */
	async raiseCommandStats(commandName) {
		const count = await this.kdb.stats.get(commandName) || 0;
		return await this.kdb.stats.set(commandName, count + 1);
	}

	/**
	 * Gets the commands' statistics.
	 * @returns {Discord.Collection}
	 * @async
	 */
	async getStats() {
		const out = new Discord.Collection();
		for (const cmdName of this.commands.keyArray()) {
			const count = await this.kdb.stats.get(cmdName) || 0;
			out.set(cmdName, count);
		}
		return out;
	}

	/**
	 * Gets a YZ table.
	 * @param {string} type Type of table to return (`CRIT` or `null`)
	 * @param {string} path Folder path to the file with the ending `/`
	 * @param {string} fileName Filename without path, ext or lang-ext
	 * @param {?string} [lang='en'] The language to use, default is `en` English
	 * @param {?string} [ext='csv'] File extension
	 * @returns {RollTable}
	 * @static
	 */
	static getTable(type, path, fileName, lang = 'en', ext = 'csv') {
		const pathName = `${path}${fileName}`;
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

		const table = new RollTable(`${fileName}.${lang}.${ext}`);
		for (const elem of elements) {
			if (type === 'CRIT') {
				const entry = new YZCrit(elem);
				table.set(entry.ref, entry);
			}
			else if (elem.hasOwnProperty('ref')) {
				table.set(elem.ref, elem);
			}
			else {
				throw new Errors.SebediusError('Unknown RollTable');
			}
		}

		return table;
	}

	/**
	 * Returns a text with all the dice turned into emojis.
	 * @param {YZRoll} roll The roll
	 * @param {Object} opts Options of the roll command
	 * @param {?boolean} [applyAliases=false] Whether to apply the aliases
	 * @returns {string} The manufactured text
	 */
	static emojifyRoll(roll, opts, applyAliases = false) {
		const game = opts.iconTemplate || roll.game;
		let str = '';

		for (const die of roll.dice) {
			const val = die.result;
			const errorIcon = ` \`{${val}}\``;
			let iconType = die.type;

			if (opts.alias) {
				// Skipping types.
				if (opts.alias[die.type] === '--' || die.type == null) continue;
				// Dice swaps, if any.
				if (applyAliases && opts.alias[die.type]) iconType = opts.alias[die.type];
			}
			// Artifact Dice specific skin.
			if (iconType === 'arto') {
				str += DICE_ICONS.fbl.arto[val] || errorIcon;
			}
			// Twilight 2000 specific skin.
			else if (game === 't2k' && iconType === 'base' && die.range !== 6) {
				str += DICE_ICONS.t2k['d' + die.range][val] || errorIcon;
			}
			else {
				const diceTypeIcons = DICE_ICONS[game][iconType];
				str += diceTypeIcons && diceTypeIcons[val]
					? diceTypeIcons[val]
					: errorIcon;
				//str += DICE_ICONS[game][iconType][val] || errorIcon;
			}
		}
		return str;
	}

	/**
	 * Returns the selected choice, or None. Choices should be a list of two-tuples of (name, choice).
	 * If delete is True, will delete the selection message and the response.
	 * If length of choices is 1, will return the only choice unless force_select is True.
	 * @param {Discord.Message} ctx Discord message with context
	 * @param {Array<string, Object>[]} choices An array of arrays with [name, object]
	 * @param {string} text Additional text to attach to the selection message
	 * @param {boolean} del Wether to delete the selection message
	 * @param {boolean} pm Wether the selection message is sent in a PM (Discord DM)
	 * @param {boolean} forceSelect Wether to force selection even if only one choice possible
	 * @returns {*} The selected choice
	 * @throws {NoSelectionElementsError} If len(choices) is 0.
	 * @throws {SelectionCancelledError} If selection is cancelled.
	 * @static
	 * @async
	 */
	static async getSelection(ctx, choices, text = null, del = true, pm = false, forceSelect = false) {
		if (choices.length === 0) throw new Errors.NoSelectionElementsError();
		else if (choices.length === 1 && !forceSelect) return choices[0][1];

		const paginatedChoices = Util.paginate(choices, 10);
		const msgFilter = m =>
			m.author.id === ctx.author.id &&
			m.channel.id === ctx.channel.id &&
			Number(m.content) >= 1 &&
			Number(m.content) <= choices.length;

		// Builds the pages.
		const pages = [];
		paginatedChoices.forEach((_choices, page) => {
			const names = _choices.map(o => o[0]);
			const embed = new Discord.MessageEmbed()
				.setTitle('Multiple Matches Found')
				.setDescription(
					'Which one were you looking for?\n'
					+ names
						.map((n, i) => `**[${i + 1 + page * 10}]** – ${n}`)
						.join('\n'),
				);
			if (paginatedChoices.length > 1) {
				embed.setFooter(`page ${page + 1}/${paginatedChoices.length}`);
			}
			if (text) {
				embed.addField('Note', text, false);
			}
			if (pm) {
				embed.addField(
					'Instructions',
					'Type your response in the channel you called the command. '
					+ 'This message was PMed to you to hide the monster name.',
					false,
				);
			}
			pages.push(embed);
		});
		// Sends the selection message.
		let msgCollector = null;
		const channel = pm ? ctx.author : ctx.channel;
		const time = 30000;
		const pageMenu = new PageMenu(channel, ctx.author.id, time * 2, pages, {
			stop: {
				icon: PageMenu.ICON_STOP,
				owner: ctx.author.id,
				fn: () => msgCollector.stop(),
			},
		});
		// Awaits for the answer.
		let msg = null;
		msgCollector = ctx.channel.createMessageCollector(msgFilter, { max: 1, time });
		msgCollector.on('end', () => pageMenu.stop());

		// Catches the answer or any rejection.
		try {
			msg = await msgCollector.next;
		}
		catch (rejected) {
			throw new Errors.SelectionCancelledError();
		}

		if (!msg || msg instanceof Map) {
			return null;
		}
		// Deletes the answer message.
		if (del && !pm) {
			try {
				await msg.delete();
			}
			catch (err) {
				console.warn('[getSelection] Failed to delete choice message.', err.name, err.code);
			}
		}
		// Returns the choice.
		return choices[Number(msg.content) - 1][1];
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
		const filter = m =>
			m.author.id === message.author.id
			&& m.channel.id === message.channel.id;
		const reply = (await message.channel.awaitMessages(filter, { max: 1, time: 30000 })).first();
		const replyBool = Util.getBoolean(reply.content) || null;
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
	 * @param {Discord.Message} ctx Discord message with context
	 * @param {number} checkPerms Bitfield / Use this argument if you want to check just a few specific Permissions.
	 * @returns {boolean} `true` if the bot has all the required Permissions.
	 * @static
	 */
	static checkPermissions(ctx, checkPerms = null) {
		const channel = ctx.channel;

		// Exits early if we are in a DM.
		if (channel.type === 'dm') return true;

		const botMember = channel.guild.me;
		const perms = checkPerms || ctx.bot.config.perms.bitfield;
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
			ctx.reply(msg);
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
	 * @returns {Promise<Discord.User>|Discord.User}
	 * @static
	 * @async
	 */
	static async getUserFromMention(mention, client) {
		// The id is the first and only match found by the RegEx.
		const matches = mention.match(/^<@!?(\d+)>$/);

		// If supplied variable was not a mention, matches will be null instead of an array.
		if (!matches) return;

		// However the first element in the matches array will be the entire mention, not just the ID,
		// so use index 1.
		const id = matches[1];

		if (client.users.cache.has(id)) {
			return client.users.cache.get(id);
		}
		else {
			return await client.users.fetch(id);
		}
	}

	/**
	 * Fetches a Member based on its name, mention or ID.
	 * @param {string} needle Name, mention or ID
	 * @param {Discord.Message} ctx The triggering message with context
	 * @returns {Promise<Discord.Member>|Discord.Member}
	 * @static
	 * @async
	 */
	static async fetchMember(needle, ctx) {
		if (Discord.MessageMentions.USERS_PATTERN.test(needle)) {
			return await Sebedius.getUserFromMention(needle, ctx.bot);
		}
		const members = ctx.channel.members;
		return members.find(mb =>
			mb.id === needle ||
			mb.displayName === needle,
		);
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