/* ===========================================================
 * STEFOUCH'S BOT
 * ===========================================================
 * Fonctionalities for the Mutant: Year Zero Roleplaying game.
 * @author	Stefouch
 * ===========================================================
 */
// First, loads the ENV variables (e.g. bot's token).
if (process.env.NODE_ENV !== 'production') {
	require('dotenv').load();
}

// Initializes requirements.
const fs = require('fs');
const Config = require('./config.json');
const db = require('./database.js');
const { test } = require('./test/tests');
const Discord = require('discord.js');
const bot = new Discord.Client();

// Initializes global constants.
let prefix = Config.defaultPrefix;

// Loads the available commands.
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require('./commands/' + file);
	bot.commands.set(command.name, command);
	console.log(`[+] - Command loaded: ${command.name}.js`);
}

/* !
 * READY LISTENER
 */
bot.on('ready', () => {
	console.log('|===========================================================');
	console.log('| CONNECTED');
	console.log(`| Logged in as: ${bot.user.username} (${bot.user.id})`);
	console.log('|===========================================================');

	// Lists servers the bot is connected to.
	console.log('| Guilds/Servers:');
	let serverQty = 0;
	bot.guilds.forEach(guild => {
		console.log(`|  * ${guild.name} (${guild.id})`);
		serverQty++;
	});
	console.log(`|  = Total: ${serverQty} server${(serverQty > 1) ? 's' : ''}`);
	console.log('|===========================================================\n');
	// Sets bot status.
	// Alternatively, you can set the activity to any of the following:
	// PLAYING, STREAMING, LISTENING, WATCHING
	// For example:
	// client.user.setActivity('TV', { type: 'WATCHING' });
	bot.user.setActivity(`MYZ on ${serverQty} server${(serverQty > 1) ? 's' : ''}`, { type: 'PLAYING' });

	// Only for testing purposes.
	if (process.env.NODE_ENV !== 'production') test();
});

/* !
 * MESSAGE LISTENER
 */
bot.on('message', message => {
	// Gets the guild's prefix.
	if (message.channel.type === 'text' && !message.author.bot) {
		const fetchedPrefix = db.get(`prefix_${message.guild.id}`);

		if (fetchedPrefix) {
			prefix = fetchedPrefix;
		}
		else {
			prefix = Config.defaultPrefix;
		}
	}

	// Answers bot's mentions and exits early.
	// Note: the regex constant cannot be put in global,
	// because bot.user.id will only be defined after some time.
	const botMentionRegex = new RegExp(`^(<@!?${bot.user.id}>)\\s*`);
	if (botMentionRegex.test(message.content)) return message.reply(`Hi! You can use \`${prefix}\` as my prefix.`);

	// Exits early if no prefix, and
	// prevents bot from responding to its own messages.
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	// Tiny commands: !ping & !prefix.
	if (commandName === 'ping') return message.channel.send('Pong!');
	else if (commandName === 'prefix') return message.reply(`You can use \`${prefix}\` as my prefix.`);

	// Gets the command from its name, with support for aliases.
	const command = bot.commands.get(commandName)
		|| bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	// Exits early if there is no command with this name.
	if (!command) return;

	// Notifies if can't DM (= PM).
	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	// Notifies if arguments are missing.
	if (command.args && !args.length) {
		let reply = `${message.author} You didn't provide any arguments!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}
		return message.channel.send(reply);
	}

	try {
		console.log(`[COMMAND] - Command received from ${message.author.tag}: ${command.name}`, args.toString());
		command.execute(args, message);
	}
	catch (error) {
		console.error('[ERROR] - At command execution.', error.stack);
		message.reply('There was an error trying to execute that command!');
	}
});

/* !
 * Catching UnhandledPromiseRejectionWarnings.
 */
process.on('unhandledRejection', error => console.error('[ERROR] - Uncaught Promise Rejection', error));

/**
 * Get your bot's secret token from:
 * https://discordapp.com/developers/applications/
 * Click on your application -> Bot -> Token -> "Click to Reveal Token".
 * Log our bot in using the token from https://discordapp.com/developers/applications/me
 */
bot.login(process.env.TOKEN);