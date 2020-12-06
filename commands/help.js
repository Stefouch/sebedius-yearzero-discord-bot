const { MessageEmbed } = require('discord.js');
const { SOURCE_MAP } = require('../utils/constants');
const CATEGORY_LIST = {
	common: 'Common',
	misc: 'Miscellaneous',
	pbptool: 'PbP Tool',
};

module.exports = {
	name: 'help',
	category: 'misc',
	description: 'Lists all available commands. If a command\'s name is specified, prints more info about that specific command instead.',
	guildOnly: false,
	args: false,
	usage: '[command name] [-list|-commands]',
	async run(args, ctx) {
		// Parses arguments.
		const argv = require('yargs-parser')(args, {
			boolean: ['list'],
			alias: {
				list: ['commands'],
			},
			default: {
				list: false,
			},
			configuration: ctx.bot.config.yargs,
		});

		// Sends a generic help message if no command name was provided.
		if (!argv._.length) {
			const embed = new MessageEmbed({
				color: ctx.bot.config.color,
				title: '**Sebedius – Year Zero Discord Bot**',
			});

			// Generic help message.
			if (!argv.list) {
				embed.addField('🏁 Deployed Version', ctx.bot.version, true);
				embed.addField('🛠 Developper', 'Stefouch#5202', true);
				embed.addField('🐦 Twitter', 'https://twitter.com/stefouch', true);
				embed.addField('📖 Readme', 'https://github.com/Stefouch/sebedius-myz-discord-bot/blob/master/README.md', false);
				embed.addField('🔗 Invite Link', ctx.bot.inviteURL, false);
				embed.addField('📚 Wiki', ctx.bot.config.wikiURL, true);
				embed.addField('🛠 Bug Report & Feature Request', 'https://github.com/Stefouch/sebedius-myz-discord-bot/issues', true);
				embed.addField('🙏 Patreon', 'https://patreon.com/Stefouch', true);
				embed.addField('🖥 Website', 'https://www.stefouch.be', true);
				embed.addField('🗒 List of Commands', `Type \`${ctx.prefix}help -list\` to get the list of all commands.`
					+ `\nType \`${ctx.prefix}help [command name]\` to get info on a specific command.`, false);
			}
			// Generic help message "with all commands".
			else {
				// Adds a link to the wiki.
				embed.description = `${ctx.bot.config.wikiURL}#list-of-commands`;

				// Hides ownerOnly commands.
				const commands = ctx.bot.commands.filter(cmd => cmd.ownerOnly !== true);

				// Build the list of types of commands.
				const commandsGroups = commands.map(cmd => cmd.category).sort();

				// Using a Set object removes the duplicates.
				const commandsGroupsSet = new Set(commandsGroups);

				// Builds the message.
				for (const type of commandsGroupsSet) {
					const commandsListedByGroup = commands.filter(cmd => cmd.category === type);
					let text = '';
					for (const [, cmd] of commandsListedByGroup) {
						text += `**${cmd.name}** – ${cmd.description.split('.')[0]}.\n`;
					}
					const title = SOURCE_MAP[type] || CATEGORY_LIST[type] || 'Unknown';
					embed.addField(title, text, false);
				}
			}
			// Sends the embed.
			if (argv.list && ctx.author.id !== ctx.bot.owner.id) {
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
			return ctx.send(embed);
		}
		// Otherwise, sends a specific help message if a command name is provided.
		const { commands } = ctx.bot;
		const name = argv._[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return ctx.reply('⚠️ That\'s not a valid command!');
		}

		const embed = new MessageEmbed({
			color: ctx.bot.config.color,
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

		// Adds a link to the wiki.
		embed.addField('Wiki', `${ctx.bot.config.wikiURL}/%21${command.name}`);

		// Sends the specific help message.
		return ctx.send(embed);
	},
};