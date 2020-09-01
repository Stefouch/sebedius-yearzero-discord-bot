const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'help',
	group: 'Other',
	description: 'Lists all available commands. If a command\'s name is specified, prints more info about that specific command instead.'
		+ '\nUse the argument `-list` to print a list of all commands, and `--no-dm` to display the help message on the channel.',
	guildOnly: false,
	args: false,
	usage: '[command name] [-list|-commands] [--no-dm]',
	async execute(args, ctx) {
		// Parses arguments.
		const argv = require('yargs-parser')(args, {
			boolean: ['dm', 'list'],
			alias: {
				list: ['commands'],
			},
			default: {
				dm: true,
				list: false,
			},
			configuration: ctx.bot.config.yargs,
		});

		// • If no argument, sends a generic help message.
		if (!argv._.length) {
			const embed = new MessageEmbed({
				color: ctx.bot.config.color,
				title: '**Sebedius – Year Zero Discord Bot**',
			});

			if (argv.list) {
				// Adds a link to the wiki.
				embed.description = 'https://github.com/Stefouch/sebedius-myz-discord-bot/wiki#list-of-commands';

				// Hides adminOnly commands.
				const commandsCollection = ctx.bot.commands.filter(cmd => cmd.adminOnly !== true);

				// Build the list of types of commands.
				const commandsGroups = commandsCollection.map(cmd => cmd.group).sort();
				// Using a Set object removes the duplicates.
				const commandsGroupsSet = new Set(commandsGroups);
				// Builds the message.
				for (const type of commandsGroupsSet) {
					const commandsListedByGroup = commandsCollection.filter(cmd => cmd.group === type);
					let text = '';
					for (const [, cmd] of commandsListedByGroup) {
						text += `**${cmd.name}** – ${cmd.description.split('.')[0]}.\n`;
					}
					embed.addField(type, text, false);
				}
			}
			else {
				embed.addField('🏁 Deployed Version', ctx.bot.version, true);
				embed.addField('🛠 Developper', 'Stefouch#5202', true);
				embed.addField('🐦 Twitter', 'https://twitter.com/stefouch', true);
				embed.addField('📖 Readme', 'https://github.com/Stefouch/sebedius-myz-discord-bot/blob/master/README.md', false);
				embed.addField('🔗 Invite Link', ctx.bot.inviteURL, false);
				embed.addField('📚 Wiki', 'https://github.com/Stefouch/sebedius-myz-discord-bot/wiki', true);
				embed.addField('🛠 Bug Report & Feature Request', 'https://github.com/Stefouch/sebedius-myz-discord-bot/issues', true);
				embed.addField('🙏 Patreon', 'https://patreon.com/Stefouch', true);
				embed.addField('🖥 Website', 'https://www.stefouch.be', true);
				embed.addField('🗒 List of Commands', `You can send \`${ctx.prefix}help -list\` to get the list of all commands, or \`${ctx.prefix}help [command name]\` to get info on a specific command!`, false);
			}

			if (argv.dm === false || ctx.author.id === ctx.bot.admin.id) {
				return ctx.channel.send(embed);
			}
			else {
				return ctx.author.send(embed)
					.then(() => {
						if (ctx.channel.type === 'dm') return;
						ctx.reply('💬 I\'ve sent you a DM with all my commands!');
					})
					.catch(error => {
						console.error(`Could not send help DM to ${ctx.author.tag}.\n`, error);
						ctx.reply('❌ It seems like I can\'t DM you! Do you have DMs disabled?');
					});
			}
		}
		// • Otherwise, if argument, sends a specific help message.
		const { commands } = ctx.bot;
		const name = argv._[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return ctx.reply('⚠️ That\'s not a valid command!');
		}

		const embed = new MessageEmbed({
			color: 0x1AA29B,
			title: `**${command.name.toUpperCase()}**`,
		});
		if (command.aliases) {
			embed.addField('Aliases', command.aliases.join(', '), true);
		}
		if (command.usage) {
			embed.addField('Usage', `\`${ctx.prefix}${command.name} ${command.usage}\``, true);
		}
		if (command.description) {
			embed.addField('Description', command.description, false);
		}

		if (command.moreDescriptions) {
			for (const desc of command.moreDescriptions) {
				embed.addField(desc[0], desc[1], false);
			}
		}

		return ctx.channel.send(embed);
	},
};