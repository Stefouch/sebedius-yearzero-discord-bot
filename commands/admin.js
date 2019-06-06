const Config = require('../config.json');

module.exports = {
	name: 'admin',
	description: 'Performs bot\'s maintenance. Only available for the bot\'s owner.',
	guildOnly: true,
	args: true,
	// usage: '',
	execute(args, message) {
		// Exits early if not the bot's owner.
		if (message.author.id !== Config.botAdminID) return;

		const bot = message.channel.members.find(member => member.id === Config.botID).client;

		if (args.includes('maintenance') || args.includes('idle')) {
			bot.user.setPresence({
				game: { name: '🚧 On Maintenance', type: 'WATCHING' },
				status: 'dnd',
				afk: true,
			});
		}
		// Lists servers the bot is connected to
		// and updates the bot's activity according to the updated value.
		else if (args.includes('servers') || args.includes('serv')) {
			const guilds = [];
			bot.guilds.forEach(guild => {
				guilds.push(`* ${guild.name} (${guild.id}) m: ${guild.memberCount}`);
			});
			message.author.send(`List of guilds:\n${guilds.join('\n')}`);
			setOnlineActivity(bot, guilds.length);
		}
	},
};

/**
 * Sets the bot's activity to online.
 * @param {Discord.client} client The bot's client
 * @param {number} serverQty Quantity of servers the bot is connected to.
 */
function setOnlineActivity(client, serverQty) {
	client.user.setActivity(`MYZ on ${serverQty} server${(serverQty > 1) ? 's' : ''}`, { type: 'PLAYING' });
	client.user.setPresence({ status: 'online', afk: false });
}