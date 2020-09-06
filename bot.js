/* ===========================================================
 * SEBEDIUS BOT
 * ===========================================================
 * Fonctionalities for Year Zero Roleplaying games.
 * @author	Stefouch
 * ===========================================================
 */
const { HTTPError, DiscordAPIError, Collection } = require('discord.js');
const SebediusErrors = require('./utils/errors');

// First, loads the ENV variables (e.g. bot's token).
// If not in production mode.
if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}
// Second, creates the (custom) bot client.
const Sebedius = require('./Sebedius');
const bot = new Sebedius(require('./config.json'));

/* !
 * READY HANDLER
 */
bot.on('ready', async () => {
	bot.owner = bot.users.cache.get(bot.config.ownerID) || await bot.users.fetch(bot.config.ownerID);
	bot.state = 'ready';
	console.log('|===========================================================');
	console.log('| CONNECTED');
	console.log(`| Logged in as: ${bot.user.tag} (${bot.user.id})`);
	console.log(`| # Servers: ${bot.guilds.cache.size}`);
	console.log('|===========================================================');

	// Sets banned users and blacklisted guilds. (Promise)
	bot.populateBans();

	// Activities Loop.
	bot.user.setActivity({ name: `v${bot.version}`, type: 'PLAYING' });
	bot.activity = require('./utils/activities')(bot);

	// Warns the admin that the bot is ready!
	if (process.env.NODE_ENV === 'production') {
		bot.owner.send(`:man_scientist: **Sebedius** is __${bot.state}__!`);
	}
});

/* !
 * MESSAGE HANDLER
 */
bot.on('message', async message => {
	// Exits early is the message was send by a bot
	// and prevents bot from responding to its own messages.
	if (message.author.bot) return;
	// if (message.author.id === bot.user.id) return;

	// Exits if the bot is not ready.
	if (bot.state !== 'ready') return;

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

	// Adds important data to the context of the message.
	// message.prefix = prefix;
	// message.bot = bot;
	const ctx = Sebedius.processMessage(message, prefix);

	// Parses the arguments.
	const args = ctx.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	// Gets the command from its name, with support for aliases.
	const command = bot.commands.get(commandName)
		|| bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	// Exits early if there is no command with this name.
	if (!command) return;

	// Aborts if the user or the guild are banned.
	if (bot.mutedUsers.has(ctx.author.id) && ctx.author.id !== bot.owner.id) {
		console.log(`[Banlist] User ${ctx.author.id} is MUTED.`);
		return await ctx.reply('⛔ You have been muted and cannot use my commands.');
	}
	if (ctx.channel.type === 'text' && bot.blacklistedGuilds.has(ctx.guild.id) && ctx.author.id !== bot.owner.id) {
		console.log(`[Banlist] Guild ${ctx.guild.id} is BLACKLISTED.`);
		return await ctx.reply('⛔ This server has been blacklisted and cannot use my commands.');
		// return await ctx.channel.guild.leave();
	}

	// Aborts if the command is owner-only and the user is not the owner.
	if (command.ownerOnly && ctx.author.id !== bot.owner.id) return;

	// Notifies if can't DM (= PM).
	if (command.guildOnly && ctx.channel.type !== 'text') {
		return ctx.reply('⚠️ I can\'t execute that command inside DMs!');
	}

	// Notifies if arguments are missing.
	if (command.args && !args.length) {
		let reply = `ℹ️ ${ctx.author} You didn't provide any arguments!`;
		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}
		return ctx.channel.send(reply);
	}

	// Sets the cooldown.
	if (command.cooldown) {
		if (!bot.cooldowns.has(command.name)) {
			bot.cooldowns.set(command.name, new Collection());
		}
		const timeNow = Date.now();
		const timeStamps = bot.cooldowns.get(command.name);
		const cdAmount = (command.cooldown || 5) * 1000;
		if (timeStamps.has(ctx.author.id)) {
			const cdExpire = timeStamps.get(ctx.author.id) + cdAmount;
			if (timeNow < cdExpire) {
				const timeLeft = (cdExpire - timeNow) / 1000;
				return ctx.reply(
					`Please wait ${timeLeft.toFixed(0)} second(s) before reusing the command \`${prefix}${command.name}\``,
				);
			}
		}
		timeStamps.set(ctx.author.id, timeNow);
		setTimeout(() => timeStamps.delete(ctx.author.id), cdAmount);
	}

	// Runs the command.
	try {
		console.log(`[CMD] ${ctx.author.tag} (${ctx.author.id})`
			+ (ctx.guild ? ` at ${ctx.guild.name} (${ctx.guild.id}) in #${ctx.channel.name} (${ctx.channel.id})` : '')
			+ `: ${command.name}`, args.toString(),
		);
		await command.run(args, ctx);
		bot.raiseCommandStats(command.name);
	}
	catch (error) {
		console.error('[Error] At command execution.');
		onError(error, ctx);
	}
});

/* !
 * GUILD HANDLER
 */
bot.on('guildCreate', async guild => {
	console.log(`[GUILD] Joined: ${guild.name} (${guild.id})`);
	if (bot.blacklistedGuilds.has(guild.id)) {
		return await guild.leave();
	}
	// if (bot.whitelistedGuilds.has(guild.id)) return;
	guild = await guild.fetch();
	const bots = guild.members.cache.filter(m => m.user.bot).size;
	const members = guild.memberCount;
	const ratio = bots / members;
	if (ratio >= 0.6 && members >= 20) {
		console.warn(`Detected bot collection server ${guild.id}, ratio ${ratio}. Leaving.`);
		try {
			await guild.owner.send(
				'Please do not add me to bot collection servers. '
				+ 'Your server was flagged for having over 60% bots.'
				+ 'If you believe this is an error, please PM the bot author.',
			);
		}
		catch (err) { console.error(err); }
		await guild.leave();
	}
});
bot.on('guildDelete', guild => {
	console.log(`[GUILD] Left: ${guild.name} (${guild.id})`);
});

/* !
 * ERROR LISTENER
 */
bot.on('error', error => onError(error));

/* !
 * Catching UnhandledPromiseRejectionWarnings.
 */
process.on('unhandledRejection', error => {
	// Logs the error.
	console.error('[Error] Uncaught Promise Rejection', error);
	onError(error);
});

/**
 * Errors Handler.
 * @param {Error} error The catched error
 * @param {Discord.Message} ctx Discord message with context
 * @async
 */
async function onError(error, ctx) {
	if (error instanceof HTTPError) {
		console.error(error.name, error.code);
	}
	else if (error instanceof DiscordAPIError) {
		console.error(error.name, error.code);
	}
	else if (error instanceof SebediusErrors.TooManyDiceError) {
		if (ctx) ctx.reply(`:warning: Cannot roll that many dice! (${error.message})`);
	}
	else if (error instanceof SebediusErrors.NoSelectionElementsError) {
		if (ctx) ctx.reply(':warning: There is no element to select.');
	}
	else if (error instanceof SebediusErrors.SelectionCancelledError) {
		if (ctx) ctx.reply(':stop_button: Selection cancelled.');
	}
	else if (error instanceof SebediusErrors.NotFoundError) {
		if (ctx) ctx.reply(`:warning: [${error.name}] ${error.message}.`);
	}
	else {
		// Sends me a message if the error is Unknown.
		if (process.env.NODE_ENV === 'production') {
			const msg = `**Error:** ${error.toString()}`
				+ `\n**Code:** ${error.code} <https://discord.com/developers/docs/topics/opcodes-and-status-codes>`
				+ `\n**Path:** ${error.path}`
				+ `\n**Stack:** ${error.stack}`;
			bot.owner.send(msg, { split: true })
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