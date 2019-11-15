const { defaultPrefix } = require('../config.json');
const { version } = require('../util/version');
const { RichEmbed } = require('discord.js');

module.exports = {
	name: 'help',
	description: 'List all availabe commands or info about a specific command.',
	aliases: ['commands', 'aide', 'hjälp', 'hjalp'],
	guildOnly: false,
	args: false,
	usage: '[command name]',
	execute(args, message) {
		const data = [];
		const { commands } = message.client;

		let prefix = defaultPrefix;

		/* if (message.channel.type === 'text') {
			const guildPrefix = db.get(`prefix_${message.guild.id}`);

			if(guildPrefix) prefix = guildPrefix;
		} */

		if (!args.length) {
			data.push('**Year Zero** Discord Bot');
			data.push(`Deployed version: **${version}**`);
			data.push('\nHere\'s a list of all my commands:');
			data.push(commands.map(command => command.name).join(', '));
			data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);
			data.push('\nReadme: <https://github.com/Stefouch/sebedius-myz-discord-bot/blob/master/README.md>');
			data.push('\nFeature request / bug report: <https://github.com/Stefouch/sebedius-myz-discord-bot/issues>');

			return message.author.send(data, { split: true })
				.then(() => {
					if (message.channel.type === 'dm') return;
					message.reply('I\'ve sent you a DM with all my commands!');
				})
				.catch(error => {
					console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
					message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
				});
		}
		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return message.reply('that\'s not a valid command!');
		}

		const embed = new RichEmbed({
			color: 0x1AA29B,
			title: `**${command.name.toUpperCase()}**`,
		});
		if (command.aliases) embed.addField('Aliases', command.aliases.join(', '), false);
		if (command.usage) embed.addField('Usage', `${prefix}${command.name} ${command.usage}`, false);
		if (command.description) embed.addField('Description', command.description, true);

		if (command.moreDescriptions) {
			for(const desc of command.moreDescriptions) {
				embed.addField(desc[0], desc[1], true);
			}
		}

		return message.channel.send(embed);
	},
};