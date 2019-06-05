const Config = require('../config.json');
const Keyv = require('keyv');

module.exports = {
	name: 'setconf',
	description: 'Sets the bot\'s configuration for this server. See possible parameters:'
		+ '\n`prefix [new value]` – Gets or sets the prefix for triggering the commands of this bot.',
	guildOnly: true,
	args: true,
	usage: '<parameter> [new value]',
	async execute(args, message) {
		// Exits early if the message's author doesn't have the ADMINISTRATOR Permission.
		if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply('This command is only available for admins.');

		// Database
		const keyv = new Keyv(Config.db);
		keyv.on('error', err => console.error('Connection Error', err));

		// The property command.args = true,
		// so no need to check args[0].
		const key = args[0].toLowerCase();
		const newKeyVal = args[1];

		// SET
		if (typeof newKeyVal !== 'undefined') {

			if (key === 'prefix') {
				await keyv.set(`prefix_${message.guild.id}`, newKeyVal);
				message.channel.send(`My prefix has been set to: "${newKeyVal}"`);
			}
			else {
				message.reply(`"${key}" is not a valid parameter.`);
			}
		}
		// GET
		else {
			const value = await keyv.get(`${key}_${message.guild.id}`);
			if (value) message.channel.send(`Parameter: "${key}" = "${value}"`);
			else message.reply(`"${key}" is not a valid parameter.`);
		}
	},
};