/* ===========================================================
 * SEBEDIUS BOT
 * ===========================================================
 * Fonctionalities for Year Zero Roleplaying games.
 * @author	Stefouch
 * ===========================================================
 */
// First, loads the ENV variables (e.g. bot's token).
if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}
const Sebedius = require('./Sebedius');
const client = new Sebedius(require('./config.json'));

/* !
 * READY LISTENER
 */
client.on('ready', () => {
	client.state = 'ready';
	console.log('|===========================================================');
	console.log('| CONNECTED');
	console.log(`| Logged in as: ${client.user.username} (${client.user.id})`);
	console.log('|===========================================================');

	// Lists servers the bot is connected to.
	console.log('| Guilds/Servers:');
	const serverQty = client.guilds.cache.size;
	/* client.guilds.cache.forEach(guild => {
		if (process.env.NODE_ENV !== 'production') {
			console.log(`|  * ${guild.name} (${guild.id}) m: ${guild.memberCount}`);
			console.log('|    * Custom emojis:');
			guild.emojis.cache.forEach(emoji => {
				console.log(`|      <:${emoji.identifier}>`);
			});
		}
		serverQty++;
	});//*/
	console.log(`|  = Total: ${serverQty} server${(serverQty > 1) ? 's' : ''}`);
	console.log('|===========================================================\n');
	// Sets bot status.
	// Alternatively, you can set the activity to any of the following:
	// PLAYING, STREAMING, LISTENING, WATCHING
	// For example:
	// client.user.setActivity('TV', { type: 'WATCHING' });
	client.user.setActivity(`YZE on ${serverQty} server${(serverQty > 1) ? 's' : ''}`, { type: 'PLAYING' });

	// Only for testing purposes.
	// if (process.env.NODE_ENV !== 'production') test(bot);
});

/* !
 * MESSAGE LISTENER
 */
client.on('message', async message => {
	// Exits early is the message was send by a bot
	// and prevents bot from responding to its own messages.
	if (message.author.bot) return;
	// if (message.author.id === client.user.id) return;

	// Gets the guild's prefixes (an array).
	const prefixes = await client.getPrefixes(message);
	let prefix;
	for (const pfx of prefixes) {
		if (message.content.startsWith(pfx)) {
			prefix = pfx;
			break;
		}
	}
	if (!prefix) return;

	// Aborts if the user or the channel are banned.
	if (client.config.bannedUsers.includes(message.author.id)) return message.reply('🚫 This user has been banned and cannot use me anymore.');
	if (client.config.bannedServers.includes(message.channel.id)) return message.reply('🚫 This server has been banned and cannot use me anymore.');

	// Parses the arguments.
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	// Gets the command from its name, with support for aliases.
	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

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
		console.log(`[COMMAND] - ${message.author.tag} (${message.author.id})`
			+ (message.guild ? ` at ${message.guild.name} (${message.guild.id})` : '')
			+ `: ${command.name}`, args.toString(),
		);
		await command.execute(args, message, client);
		client.raiseCommandStats(command.name);
	}
	catch (error) {
		console.error('[ERROR] - At command execution.', error);
		message.reply(`❌ There was an error trying to execute that command! (${error.toString()})`);
	}
});

/* !
 * Catching UnhandledPromiseRejectionWarnings.
 */
process.on('unhandledRejection', error => {
	// Logs the error.
	console.error('[ERROR] - Uncaught Promise Rejection', error);
	// Sends me a personal message about the error.
	if (process.env.NODE_ENV === 'production') {
		const msg = `**Error:** ${error.toString()}`
			+ `\n**Code:** ${error.code} <https://discord.com/developers/docs/topics/opcodes-and-status-codes>`
			+ `\n**Path:** ${error.path}`
			+ `\n**Stack:** ${error.stack}`;
		client.users.cache.get(client.config.botAdminID).send(msg, { split: true })
			.catch(err => console.error(err));
	}
});

/**
 * Get your bot's secret token from:
 * https://discordapp.com/developers/applications/
 * Click on your application -> Bot -> Token -> "Click to Reveal Token".
 * Log our bot in using the token from https://discordapp.com/developers/applications/me
 */
client.login(process.env.TOKEN);