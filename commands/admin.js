const Discord = require('discord.js');
const ms = require('ms');
const os = require('os');
const worker = require('core-worker');
const YZEmbed = require('../util/YZEmbed');

module.exports = {
	name: 'admin',
	description: 'Performs bot\'s maintenance. Only available for the bot\'s owner.',
	guildOnly: true,
	args: true,
	// usage: '',
	async execute(args, message, client) {
		// Exits early if not the bot's owner.
		if (message.author.id !== client.config.botAdminID) return;

		if (args.includes('maintenance') || args.includes('idle')) {
			client.user.setPresence({
				game: { name: '🚧 On Maintenance', type: 'WATCHING' },
				status: 'dnd',
				afk: true,
			});
		}
		// Lists servers the bot is connected to
		// and updates the bot's activity according to the updated value.
		else if (args.includes('servers') || args.includes('serv')) {
			const guilds = [];
			client.guilds.forEach(guild => {
				guilds.push(`* ${guild.name} (${guild.id}) m: ${guild.memberCount}`);
			});
			message.author.send(`List of guilds:\n${guilds.join('\n')}`, { split: true });
			setOnlineActivity(client, guilds.length);
		}
		// Gets info from the Bot.
		else if (args.includes('botinfo')) {
			try {
				const npmv = await worker.process('npm -v').death();
				const stats = new YZEmbed()
					.setTitle('`Sebedius Statistics`')
					.addField('Memory Usage', `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, true)
					.addField('Swap Partition Size', `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`, true)
					.addField('Uptime', ms(client.uptime), true)
					.addField('Users', client.users.cache.size, true)
					.addField('Servers', client.guilds.cache.size, true)
					.addField('Channels', client.channels.cache.size, true)
					.addField('Emojis', client.emojis.cache.size, true)
					.addField('Library', 'discord.js', true)
					.addField('Library Version', `v${Discord.version}`, true)
					.addField('Bot Created', client.user.createdAt, true)
					.addField('Node Version', process.version, true)
					.addField('NPM Version', npmv.data.replace('\n', ''), true)
					.addField('OS', `${os.platform()} (${process.arch})`, true)
					.setTimestamp();
				message.channel.send(stats);
			}
			catch (err) {
				console.error('Botinfo error', err);
			}
		}
	},
};

/**
 * Sets the bot's activity to online.
 * @param {Discord.client} client The bot's client
 * @param {number} serverQty Quantity of servers the bot is connected to.
 */
function setOnlineActivity(client, serverQty) {
	client.user.setActivity(`YZE on ${serverQty} server${(serverQty > 1) ? 's' : ''}`, { type: 'PLAYING' });
	client.user.setPresence({ status: 'online', afk: false });
}