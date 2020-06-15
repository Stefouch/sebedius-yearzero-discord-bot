const { defaultPrefix } = require('../config.json');
const { version } = require('../util/version');
const { MessageEmbed } = require('discord.js');
const db = require('../database/database');

module.exports = {
	name: 'help',
	description: 'List all availabe commands or info about a specific command.',
	aliases: ['commands', 'aide', 'hjälp', 'hjalp'],
	guildOnly: false,
	args: false,
	usage: '[command name]',
	async execute(args, message, client) {
		const data = [];
		const { commands } = client;

		let prefix = defaultPrefix;

		if (message.channel.type === 'text') {
			const guildPrefix = await db.get(message.guild.id, 'prefix');
			if (guildPrefix) prefix = guildPrefix;
		}

		if (!args.length) {
			const commandsTextlist = `\`${commands.map(command => command.name).join('`, `')}\`.`
				+ `\n\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`;

			const linksTextlist = '📖 **Readme**\nhttps://github.com/Stefouch/sebedius-myz-discord-bot/blob/master/README.md'
				+ '\n\n🛠 **Feature request / bug report**\nhttps://github.com/Stefouch/sebedius-myz-discord-bot/issues'
				+ '\n\n🦾 **Patreon Page**\nhttps://patreon.com/Stefouch';

			const embed = new MessageEmbed({
				color: 0x1AA29B,
				title: '**Sebedius – Year Zero Discord Bot**',
			});
			embed.addField('Deployed Version', version, true);
			embed.addField('List of Commands', commandsTextlist, false);
			embed.addField('Links', linksTextlist, false);

			return message.author.send(embed)
				.then(() => {
					if (message.channel.type === 'dm') return;
					message.reply('I\'ve sent you a DM with all my commands!');
				})
				.catch(error => {
					console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
					message.reply('It seems like I can\'t DM you! Do you have DMs disabled?');
				});
		}
		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return message.reply('That\'s not a valid command!');
		}

		const embed = new MessageEmbed({
			color: 0x1AA29B,
			title: `**${command.name.toUpperCase()}**`,
		});
		if (command.aliases) embed.addField('Aliases', command.aliases.join(', '), false);
		if (command.usage) embed.addField('Usage', `${prefix}${command.name} ${command.usage}`, false);
		if (command.description) embed.addField('Description', command.description, false);

		if (command.moreDescriptions) {
			for(const desc of command.moreDescriptions) {
				embed.addField(desc[0], desc[1], false);
			}
		}

		return message.channel.send(embed);
	},
};