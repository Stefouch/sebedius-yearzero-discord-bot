const { tryDelete } = require('../Sebedius');
const { CharacterEmbed } = require('../utils/embeds');
const { __ } = require('../lang/locales');

const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

module.exports = {
	name: 'importcharacter',
	aliases: ['importsheet', 'import', 'lasse', 'forbidden-sheet'],
	category: 'common',
	description: 'cimportcharacter-description',
	guildOnly: true,
	args: true,
	usage: '<url> [-v] [-lang <language_code>]',
	/**
	 * @param {string[]} args Command's arguments
	 * @param {import('../utils/ContextMessage')} ctx Discord message with context
	 * @returns {import('../yearzero/models/sheet/Character')} The imported character
	 */
	async run(args, ctx) {
		const argv = require('yargs-parser')(args, {
			boolean: ['v'],
			string: ['lang'],
			alias: {
				lang: ['lng', 'language'],
			},
			default: {
				v: false,
				lang: null,
			},
			configuration: ctx.bot.config.yargs,
		});
		const lang = await ctx.bot.getValidLanguageCode(argv.lang, ctx);
		const url = argv._[0];

		// Exits early is the argument is not a valid URL.
		if (!URL_REGEX.test(url)) return await ctx.reply('⚠️ ' + __('cimportcharacter-invalid-url', lang));

		const infoMsg = await ctx.send('📥 ' + __('cimportcharacter-importing', lang));

		// Imports the character.
		const character = await ctx.bot.characters.import(ctx.author.id, url, lang);

		if (!character) {
			await infoMsg.edit(`❌ ${__('cimportcharacter-could-not-retrieve', lang)} \`${url}\``)
				.catch(console.error);
		}
		else {
			await infoMsg.edit(`✅ **${character.name}** ${__('cimportcharacter-success', lang)}`)
				.catch(console.error);

			setTimeout(() => tryDelete(infoMsg), 3000);
		}

		if (argv.v) {
			console.log(character);
			await ctx.send(new CharacterEmbed(character, ctx, lang));
		}

		await tryDelete(ctx);

		return character;
	},
};