const Config = require('../config.json');
const db = require('../database.js');

module.exports = {
	name: 'admin',
	description: 'Performs bot\'s maintenance. Only available for the bot\'s owner.',
	// aliases: [''],
	guildOnly: true,
	args: true,
	// usage: '',
	execute(args, message) {
		// Exits early if not the bot's owner.
		if (message.author.id !== Config.botAdminID) return;

		const bot = message.channel.members.find(member => member.id === Config.botID).client;

		if (args.includes('database') || args.includes('db')) {
			const data = db.list();
			message.author.send(data);
		}
		if (args.includes('maintenance')) {
			bot.user.setPresence({ game: { name: '🚧 On Maintenance', type: 'WATCHING' }, status: 'dnd', afk: true });
		}
		// Lists servers the bot is connected to
		// and updates the bot's activity according to the updated value.
		else if (args.includes('servers') || args.includes('serv')) {
			const guilds = [];
			bot.guilds.forEach(guild => {
				guilds.push(`* ${guild.name} (${guild.id})`);
			});
			message.author.send('List of guilds:\n' + guilds.join('\n'));
			setActivity(bot, guilds.length);
		}
	},
};

function setActivity(client, serverQty) {
	client.user.setActivity(`MYZ on ${serverQty} server${(serverQty > 1) ? 's' : ''}`, { type: 'PLAYING' });
	client.user.setPresence({ status: 'online', afk: false });
}