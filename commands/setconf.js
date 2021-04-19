const { SUPPORTED_GAMES, SUPPORTED_LANGS, SOURCE_MAP } = require('../utils/constants');
const { __ } = require('../lang/locales');

module.exports = {
	name: 'setconf',
	category: 'misc',
	description: 'csetconf-description',
	guildOnly: true,
	args: true,
	usage: '<parameter> [new value]',
	async run(args, ctx) {
		// Exits early if the message's author doesn't have the ADMINISTRATOR Permission.
		// The bot.owner may bypass this security check.
		if (
			!ctx.member.hasPermission('ADMINISTRATOR')
			&& ctx.author.id !== ctx.bot.owner.id
		) {
			return ctx.reply(`⛔ ${__('csetconf-only-admin', ctx.bot.getLanguage(ctx))}`);
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
					ctx.send(`✅ ${__('csetconf-prefix', await ctx.bot.getLanguage(ctx))} "**${newVal}**"`);
				}
				else if (key === 'game' && SUPPORTED_GAMES.includes(newVal)) {
					ctx.bot.games.set(guildID, newVal);
					await ctx.bot.kdb.games.set(guildID, newVal);
					ctx.send(`✅ ${__('csetconf-game', await ctx.bot.getLanguage(ctx))} **${SOURCE_MAP[newVal]}**`);
				}
				else if (key === 'lang' && Object.keys(SUPPORTED_LANGS).includes(newVal)) {
					ctx.bot.langs.set(guildID, newVal);
					await ctx.bot.kdb.langs.set(guildID, newVal);
					ctx.send(`✅ ${__('csetconf-language', await ctx.bot.getLanguage(ctx))} **${SUPPORTED_LANGS[newVal]}**`);
				}
				else {
					ctx.reply(`❌ ${__('csetconf-invalid-value', await ctx.bot.getLanguage(ctx)).replace('{will_be_replaced}', key)}`);
				}
			}
			// GET
			else {
				const namespace = dbNamespaces[key];
				const value = await ctx.bot.kdb[namespace].get(guildID);
				if (value) ctx.send(`🏷️ Parameter: "${key}" = "${value}"`);
				else ctx.reply(`❌ ${__('csetconf-cannot-get-value', await ctx.bot.getLanguage(ctx)).replace('{will_be_replaced}', key)}`);
			}
		}
		else {
			ctx.reply(`❌ **${key}** ${__('csetconf-invalid-parameter', await ctx.bot.getLanguage(ctx))}`);
		}
	},
};