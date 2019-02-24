const Config = require('../config.json');
const dbFile = require('../database.json');

module.exports = {
	name: 'admin',
	description: 'Performs bot\'s maintenance. Only available for the bot\'s owner.',
	// aliases: ['akth'],
	guildOnly: false,
	args: false,
	// usage: '',
	execute(args, message) {
		// Exits early if not the bot's owner.
		if (message.author.id !== Config.botAdmins[0]) return;
		console.log(dbFile);
	},
};