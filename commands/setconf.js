const Config = require('../config.json');
const db = require('../database/database');

module.exports = {
	name: 'setconf',
	description: 'Sets the bot\'s configuration for this server. See possible parameters:'
		+ '\n`prefix [new value]` – Gets or sets the prefix for triggering the commands of this bot.'
		+ '\n`game [new value]` – Gets or sets the default icon template for the rolled dice.'
		+ ` Options are \`${Config.supportedGames.join('`, `')}\`.`,
	guildOnly: true,
	args: true,
	usage: '<parameter> [new value]',
	async execute(args, message, client) {
		// Exits early if the message's author doesn't have the ADMINISTRATOR Permission.
		// The Bot Admin may bypass this security check.
		if (
			!message.member.hasPermission('ADMINISTRATOR')
			&& message.author.id !== client.config.botAdminID
		) {
			return message.reply('This command is only available for admins.');
		}

		// The property command.args = true,
		// so no need to check args[0].
		const key = args[0].toLowerCase();
		const newKeyVal = args[1];

		const verifiedParameters = ['prefix', 'game'];

		if (verifiedParameters.includes(key)) {
			// SET
			if (typeof newKeyVal !== 'undefined') {

				if (key === 'prefix') {
					await db.set(message.guild.id, newKeyVal, 'prefix');
					message.channel.send(`My prefix has been set to: "${newKeyVal}"`);
				}
				else if (key === 'game' && client.config.supportedGames.includes(newKeyVal)) {
					await db.set(message.guild.id, newKeyVal, 'game');
					message.channel.send(`The Rolled dice default icon layout has been set to: "${newKeyVal}"`);
				}
				else {
					message.reply(`The value you typed for "${key}" is unsupported.`);
				}
			}
			// GET
			else {
				const value = await db.get(message.guild.id, key);
				if (value) message.channel.send(`Parameter: "${key}" = "${value}"`);
				else message.reply(`Impossible to get the value from "${key}" parameter.`);
			}
		}
		else {
			message.reply(`"${key}" is not a parameters.`);
		}
	},
};