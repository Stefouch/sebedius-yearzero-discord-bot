/* ===========================================================
 * STEFOUCH'S BOT
 * ===========================================================
 * Fonctionalities for the Mutant: Year Zero Roleplaying game.
 * @author	Stefouch
 * ===========================================================
 */
// First, loads the ENV variables (e.g. bot's token).
if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

// Initializes requirements.
const fs = require('fs');
const db = require('./database/database');
// const { test } = require('./test/tests');
const Discord = require('discord.js');
const client = new Discord.Client();

// Adds the configuration file.
client.config = require('./config.json');
console.log('[+] - Config loaded');

// Initializes global constants.
let prefix = client.config.defaultPrefix;

// Loads the available commands.
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require('./commands/' + file);
	client.commands.set(command.name, command);
	console.log(`[+] - Command loaded: ${command.name}.js`);
}

/* !
 * READY LISTENER
 */
client.on('ready', () => {
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
	// Gets the guild's prefix.
	if (message.channel.type === 'text' && !message.author.bot) {
		const fetchedPrefix = await db.get(message.guild.id, 'prefix');

		if (fetchedPrefix) {
			prefix = fetchedPrefix;
		}
		else {
			prefix = client.config.defaultPrefix;
		}
	}

	// Answers bot's mentions and exits early.
	// Note: the regex constant cannot be put in global,
	// because bot.user.id will only be defined after some time.
	const botMentionRegex = new RegExp(`^(<@!?${client.user.id}>)\\s*`);
	if (botMentionRegex.test(message.content)) return message.reply(`Hi! You can use \`${prefix}\` as my prefix.`);

	// Exits early if no prefix, and
	// prevents bot from responding to its own messages.
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	// Aborts if the user or the channel are banned.
	if (client.config.bannedUsers.includes(message.author.id)) return message.reply('🚫 This user has been banned and cannot use me anymore.');
	if (client.config.bannedServers.includes(message.channel.id)) return message.reply('🚫 This server has been banned and cannot use me anymore.');

	// Aborts if the bot doesn't have the needed permissions.
	/* if (message.channel.type !== 'dm') {
	 	if (!message.guild.me.hasPermission(client.config.neededPermissions)) {
			const msg = '🛑 **Missing Permissions!**'
				+ '\nThe bot does not have sufficient permission in this channel.'
				+ `\nThe bot requires the \`${client.config.neededPermissions.join('`, `')}\` permissions in order to work.`;
			return message.reply(msg);
		}
	}//*/

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
	}
	catch (error) {
		console.error('[ERROR] - At command execution.', error.stack);
		message.reply('❌ There was an error trying to execute that command!');
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