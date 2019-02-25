const db = require('../database.js');

module.exports = {
	name: 'setconf',
	description: 'Sets the bot\'s configuration for this server. See possible parameters:'
		+ '\n`prefix [new value]` – Gets or sets the prefix for triggering the commands of this bot.',
	guildOnly: true,
	args: true,
	usage: '<parameter> [new value]',
	execute(args, message) {
		// Exits early if the message's author doesn't have the ADMINISTRATOR Permission.
		if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply('This command is only available for admins.');

		// The property command.args = true,
		// so no need to check args[0].
		const key = args[0].toLowerCase();
		const newKeyVal = args[1];

		// SET
		if (typeof newKeyVal !== 'undefined') {

			if (key === 'prefix') {
				db.set(`prefix_${message.guild.id}`, newKeyVal);
				message.channel.send(`My prefix has been set to: "${newKeyVal}"`);
			}
			else {
				message.reply(`"${key}" is not a valid parameter.`);
			}
		}
		// GET
		else {
			const value = db.get(`${key}_${message.guild.id}`);

			if (value) message.channel.send(`Parameter: "${key}" = "${value}"`);
			else message.reply(`"${key}" is not a valid parameter.`);
		}
	},
};