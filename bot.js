/* ===========================================================
 * SEBEDIUS BOT
 * ===========================================================
 * Fonctionalities for Year Zero Roleplaying games.
 * @author	Stefouch
 * ===========================================================
 */
const { HTTPError, DiscordAPIError } = require('discord.js');
const SebediusErrors = require('./utils/errors');

// First, loads the ENV variables (e.g. bot's token).
if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}
const Sebedius = require('./Sebedius');
const bot = new Sebedius(require('./config.json'));

/* !
 * READY LISTENER
 */
bot.on('ready', async () => {
	bot.admin = bot.users.cache.get(bot.config.ownerID) || await bot.users.fetch(bot.config.ownerID);
	bot.state = 'ready';
	console.log('|===========================================================');
	console.log('| CONNECTED');
	console.log(`| Logged in as: ${bot.user.tag} (${bot.user.id})`);
	console.log(`| # Servers: ${bot.guilds.cache.size}`);
	console.log('|===========================================================');

	// Activities Loop.
	bot.user.setActivity({ name: 'Ready to roll dice', type: 'PLAYING' });
	bot.activity = require('./utils/activities')(bot);

	// Only for testing purposes.
	// if (process.env.NODE_ENV !== 'production') test(bot);

	// Warns the admin that the bot is ready!
	if (process.env.NODE_ENV === 'production') {
		bot.admin.send(`:man_scientist: **Sebedius** is __${bot.state}__!`);
	}
});

/* !
 * MESSAGE LISTENER
 */
bot.on('message', async message => {
	// Exits early is the message was send by a bot
	// and prevents bot from responding to its own messages.
	if (message.author.bot) return;
	// if (message.author.id === bot.user.id) return;

	// Gets the guild's prefixes (an array).
	const prefixes = await bot.getPrefixes(message);
	let prefix;
	for (const pfx of prefixes) {
		if (message.content.startsWith(pfx)) {
			prefix = pfx;
			break;
		}
	}
	if (!prefix) return;

	// Aborts if the user or the channel are banned.
	if (bot.config.bannedUsers.includes(message.author.id)) return message.reply('🚫 This user has been banned and cannot use me anymore.');
	if (bot.config.bannedServers.includes(message.channel.id)) return message.reply('🚫 This server has been banned and cannot use me anymore.');

	// Adds important data to the context of the message.
	message.prefix = prefix;
	message.bot = bot;

	// Parses the arguments.
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	// Gets the command from its name, with support for aliases.
	const command = bot.commands.get(commandName)
		|| bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	// Exits early if there is no command with this name.
	if (!command) return;

	// Notifies if can't DM (= PM).
	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('⚠️ I can\'t execute that command inside DMs!');
	}

	// Notifies if arguments are missing.
	if (command.args && !args.length) {
		let reply = `ℹ️ ${message.author} You didn't provide any arguments!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}
		return message.channel.send(reply);
	}

	try {
		console.log(`[COMMAND] ${message.author.tag} (${message.author.id})`
			+ (message.guild ? ` at ${message.guild.name} (${message.guild.id})` : '')
			+ `: ${command.name}`, args.toString(),
		);
		await command.execute(args, message);
		bot.raiseCommandStats(command.name);
	}
	catch (error) {
		console.error('[Error] At command execution.');
		onError(message, error);
	}
});

/* !
 * ERROR LISTENER
 */
bot.on('error', error => onError(null, error));

/* !
 * Catching UnhandledPromiseRejectionWarnings.
 */
process.on('unhandledRejection', error => {
	// Logs the error.
	console.error('[Error] Uncaught Promise Rejection', error);
	onError(null, error);
});


/**
 * Errors Manager.
 * @param {Discord.Message} ctx Discord message with context
 * @param {Error} error The catched error
 * @async
 */
async function onError(ctx, error) {
	if (error instanceof HTTPError) {
		console.error(error.name, error.code);
	}
	else if (error instanceof DiscordAPIError) {
		console.error(error.name, error.code);
	}
	else if (error instanceof SebediusErrors.NoSelectionElementsError) {
		if (ctx) ctx.reply(':warning: There is no element to select.');
	}
	else if (error instanceof SebediusErrors.SelectionCancelledError) {
		if (ctx) ctx.reply(':stop_button: Selection cancelled.');
	}
	else if (error instanceof SebediusErrors.NotFoundError) {
		if (ctx) ctx.reply(`:warning: ${error.message}.`);
	}
	else {
		// Sends me a message if the error is Unknown.
		if (process.env.NODE_ENV === 'production') {
			const msg = `**Error:** ${error.toString()}`
				+ `\n**Code:** ${error.code} <https://discord.com/developers/docs/topics/opcodes-and-status-codes>`
				+ `\n**Path:** ${error.path}`
				+ `\n**Stack:** ${error.stack}`;
			bot.admin.send(msg, { split: true })
				.catch(console.error);
		}
		if (ctx) {
			ctx.reply(`❌ There was an error trying to execute that command! (${error.toString()})`)
				.catch(console.error);
		}
	}
	if (process.env.NODE_ENV !== 'production') {
		console.error(error);
	}
}

/**
 * Get your bot's secret token from:
 * https://discordapp.com/developers/applications/
 * Click on your application -> Bot -> Token -> "Click to Reveal Token".
 * Log our bot in using the token from https://discordapp.com/developers/applications/me
 */
bot.login(process.env.TOKEN);