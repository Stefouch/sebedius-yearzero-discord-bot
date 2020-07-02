const { SUPPORTED_GAMES, SUPPORTED_LANGS } = require('../utils/constants');

module.exports = {
	name: 'setconf',
	group: 'Customization',
	description: 'Sets the bot\'s configuration for this server. If you omit the new value, it returns the current value.'
		+ ' See possible parameters:'
		+ '\n`prefix [new value]` – Gets or sets the prefix for triggering the commands of this bot.'
		+ '\n`game [new value]` – Gets or sets the default game used (for dice skins and critical injuries tables).'
		+ ` Options are \`${SUPPORTED_GAMES.join('`, `')}\`.`
		+ '\n`lang [new value]` – Gets or sets the default language. See Readme for details.',
	guildOnly: true,
	args: true,
	usage: '<parameter> [new value]',
	async execute(args, ctx) {
		// Exits early if the message's author doesn't have the ADMINISTRATOR Permission.
		// The Bot Admin may bypass this security check.
		if (
			!ctx.member.hasPermission('ADMINISTRATOR')
			&& ctx.author.id !== ctx.bot.config.botAdminID
		) {
			return ctx.reply('⛔ This command is only available for admins.');
		}

		// The property command.args = true,
		// so no need to check args[0].
		const key = args[0].toLowerCase();
		const newVal = args[1];
		const guildID = ctx.guild.id;

		const dbNamespaces = {
			prefix: 'prefixes',
			game: 'games',
			lang: 'langs',
		};
		const verifiedParameters = ['prefix', 'game', 'lang'];

		if (verifiedParameters.includes(key)) {
			// SET
			if (typeof newVal !== 'undefined') {

				if (key === 'prefix') {
					ctx.bot.prefixes.set(guildID, newVal);
					await ctx.bot.kdb.prefixes.set(guildID, newVal);
					ctx.channel.send(`✅ My prefix has been set to "**${newVal}**"`);
				}
				else if (key === 'game' && SUPPORTED_GAMES.includes(newVal)) {
					ctx.bot.games.set(guildID, newVal);
					await ctx.bot.kdb.games.set(guildID, newVal);
					ctx.channel.send(`✅ The default game has been set to **${newVal}**`);
				}
				else if (key === 'lang' && SUPPORTED_LANGS.includes(newVal)) {
					ctx.bot.langs.set(guildID, newVal);
					await ctx.bot.kdb.langs.set(guildID, newVal);
					ctx.channel.send(`✅ The default language has been set to **${newVal}**`);
				}
				else {
					ctx.reply(`❌ The value you typed for **${key}** is unsupported.`);
				}
			}
			// GET
			else {
				const namespace = dbNamespaces[key];
				const value = await ctx.bot.kdb[namespace].get(guildID);
				if (value) ctx.channel.send(`🏷️ Parameter: "${key}" = "${value}"`);
				else ctx.reply(`❌ Impossible to get the value from **${key}** parameter.`);
			}
		}
		else {
			ctx.reply(`❌ **${key}** is not a valid parameter.`);
		}
	},
};