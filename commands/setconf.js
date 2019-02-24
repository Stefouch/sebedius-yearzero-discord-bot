const db = require('../database.js');

module.exports = {
	name: 'setconf',
	description: getCommandDescription(),
	// aliases: ['set-configuration'],
	guildOnly: true,
	args: true,
	usage: '<parameter> <value>',
	execute(args, message) {
		// SET
		if (message.member.hasPermission('ADMINISTRATOR')) {
			if (args[0] && args[1]) {

				if (args[0] === 'prefix') {
					db.set(`prefix_${message.guild.id}`, args[1]);
					message.channel.send(`My prefix has been set to: "${args[1]}"`);
				}
				else {
					message.reply(`"${args[0]}" is not a valid parameter.`);
				}
			}
			// GET
			else if (args[0]) {
				const value = db.get(`${args[0]}_${message.guild.id}`);

				if (value) {
					message.channel.send(`Parameter: "${args[0]}" = "${value}"`);
				}
				else {
					message.reply(`"${args[0]}" is not a valid parameter.`);
				}
			}
		}
		else {
			message.reply('This command is only available for admins.');
		}
	},
};

/**
 * Detailed description of the command.
 * @returns {string} The command's detailed description
 */
function getCommandDescription() {
	let desc = 'Sets the bot\'s configuration for this server. See possible parameters:';
	desc += '\n`prefix [value]` : Gets or sets the prefix for triggering the commands of this bot.';
	// desc += '\n`icons <myz|fbl>` : Uses MYZ or FBL dice icons (default is MYZ).';
	return desc;
}