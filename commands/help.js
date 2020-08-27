const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'help',
	group: 'Core',
	description: 'List all availabe commands or info about a specific command.'
		+ '\nUse the argument `--no-dm` to display the help message on the channel.',
	guildOnly: false,
	args: false,
	usage: '[command name]',
	async execute(args, ctx) {
		// Parsing arguments.
		// See https://www.npmjs.com/package/yargs-parser#api for details.
		const argv = require('yargs-parser')(args, {
			boolean: ['dm'],
			default: {
				dm: true,
			},
			configuration: ctx.bot.config.yargs,
		});

		const { commands, config } = ctx.bot;

		// • If no argument, sends a generic help message.
		if (!argv._.length) {
			const embed = new MessageEmbed({
				color: 0x1AA29B,
				title: '**Sebedius – Year Zero Discord Bot**',
			});
			embed.addField('🏁 Deployed Version', ctx.bot.version, true);
			embed.addField('🛠 Developper', 'Stefouch#5202', true);
			embed.addField('🐦 Twitter', 'https://twitter.com/stefouch', true);
			embed.addField('📖 Readme', 'https://github.com/Stefouch/sebedius-myz-discord-bot/blob/master/README.md', false);
			embed.addField('🔗 Invite Link', `https://discordapp.com/api/oauth2/authorize?client_id=${config.botID}&scope=bot&permissions=${config.perms.bitfield}`, false);
			embed.addField('🛠 Feature & Bug Report', 'https://github.com/Stefouch/sebedius-myz-discord-bot/issues', true);
			embed.addField('🦾 Patreon', 'https://patreon.com/Stefouch', true);
			embed.addField('🖥 Website', 'https://www.stefouch.be', true);
			embed.addField('🗒 List of Commands', `You can send \`${ctx.prefix}help [command name]\` to get info on a specific command! See the list of commands below.`, false);

			// Hides adminOnly commands.
			const commandsCollection = commands.filter(cmd => cmd.adminOnly !== true);

			// Build the list of types of commands.
			const commandsGroups = commandsCollection.map(cmd => cmd.group).sort();
			// Using a Set object removes the duplicates.
			const commandsGroupsSet = new Set(commandsGroups);
			// Builds the message.
			for (const type of commandsGroupsSet) {
				const commandsListedByGroup = commandsCollection.filter(cmd => cmd.group === type);
				let text = '';
				for (const [key, cmd] of commandsListedByGroup) {
					text += `**${cmd.name}** – ${cmd.description.split('.')[0]}.\n`;
				}
				embed.addField(type, text, false);
			}

			// Temporary Permission help.
			embed.addField('⚠️ Permission Issues?', 'If you\'ve permission issues with the bot, `READ_MESSAGE_HISTORY` might be missing (newly required). Otherwise, check the Readme.', false);

			if (argv.dm === false) {
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