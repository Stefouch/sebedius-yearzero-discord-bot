const { MessageEmbed } = require('discord.js');
const { SOURCE_MAP } = require('../utils/constants');
const { __ } = require('../lang/locales');
const CATEGORY_LIST = {
	common: 'Common',
	misc: 'Miscellaneous',
	pbptool: 'PbP Tool',
};

module.exports = {
	name: 'help',
	category: 'misc',
	description: 'chelp-description',
	guildOnly: false,
	args: false,
	usage: '[command name] [-list|-commands] [-lang <language_code>]',
	async run(args, ctx) {
		// Parses arguments.
		const argv = require('yargs-parser')(args, {
			boolean: ['list'],
			string: ['lang'],
			alias: {
				list: ['commands'],
				lang: ['lng', 'language'],
			},
			default: {
				list: false,
				lang: null,
			},
			configuration: ctx.bot.config.yargs,
		});
		const lang = await ctx.bot.getValidLanguageCode(argv.lang, ctx);

		// Sends a generic help message if no command name was provided.
		if (!argv._.length) {
			const embed = new MessageEmbed({
				color: ctx.bot.config.color,
				title: '**Sebedius – Year Zero Discord Bot**',
			});

			// Generic help message.
			if (!argv.list) {
				embed.addField('🏁 Deployed Version', ctx.bot.version, true);
				embed.addField('🛠 Developer', 'Stefouch#5202', true);
				embed.addField('🐦 Twitter', 'https://twitter.com/stefouch', true);
				embed.addField('📖 Readme', 'https://github.com/Stefouch/sebedius-yearzero-discord-bot/blob/master/README.md', false);
				embed.addField('🔗 Invite Link', ctx.bot.inviteURL, false);
				embed.addField('📚 Wiki', ctx.bot.config.wikiURL, true);
				embed.addField('🛠 Bug Report & Feature Request', 'https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues', true);
				embed.addField('🙏 Patreon', 'https://patreon.com/Stefouch', true);
				embed.addField('🖥 Website', 'https://www.stefouch.be', true);
				embed.addField('🗒 ' + __('chelp-command-list-title', lang), __('chelp-command-list-text', lang).replace(/{prefix}/g, ctx.prefix), false);
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
						text += `**${cmd.name}** – ${__(cmd.description, lang).split('.')[0]}.\n`;
					}
					const title = SOURCE_MAP[type] || CATEGORY_LIST[type] || __('unknown', lang);
					embed.addField(title, text, false);
				}
			}
			// Sends the embed.
			if (argv.list && ctx.author.id !== ctx.bot.owner.id) {
				return ctx.author.send(embed)
					.then(() => {
						if (ctx.channel.type === 'dm') return;
						ctx.reply('💬 ' + __('chelp-sent-dm', lang));
					})
					.catch(error => {
						console.error(`Could not send help DM to ${ctx.author.tag}.\n`, error);
						ctx.reply('❌ ' + __('chelp-dm-error', lang));
					});
			}
			return ctx.send(embed);
		}
		// Otherwise, sends a specific help message if a command name is provided.
		const { commands } = ctx.bot;
		const name = argv._[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return ctx.reply('⚠️ ' + __('chelp_invalid-command', lang));
		}

		const embed = new MessageEmbed({
			color: ctx.bot.config.color,
			title: `**${command.name.toUpperCase()}**`,
		});
		if (command.aliases) {
			embed.addField(__('aliases', lang), command.aliases.join(', '), true);
		}
		if (command.usage) {
			embed.addField(__('usage', lang), `\`${ctx.prefix}${command.name} ${command.usage}\``, true);
		}
		if (command.description) {
			embed.addField(__('description', lang), __(command.description, lang), false);
		}

		if (command.moreDescriptions) {
			for (const desc of __(command.moreDescriptions, lang)) {
				embed.addField(desc[0], desc[1], false);
			}
		}

		// Adds a link to the wiki.
		embed.addField('Wiki', `${ctx.bot.config.wikiURL}/%21${command.name}`);

		// Sends the specific help message.
		return ctx.send(embed);
	},
};