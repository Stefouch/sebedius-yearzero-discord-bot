const { CharacterEmbed } = require('../utils/embeds');

const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

module.exports = {
	name: 'importcharacter',
	aliases: ['importsheet', 'import', 'lasse', 'forbidden-sheet'],
	category: 'common',
	description: 'Imports a character sheet',
	guildOnly: true,
	args: true,
	usage: '<url> [-v]',
	/**
	 * @param {string[]} args Command's arguments
	 * @param {import('../utils/ContextMessage')} ctx Discord message with context
	 */
	async run(args, ctx) {
		const argv = require('yargs-parser')(args, {
			boolean: ['v'],
			default: {
				v: true,
			},
			configuration: ctx.bot.config.yargs,
		});
		const url = argv._[0];

		// Exits early is the argument is not a valid URL.
		if (!URL_REGEX.test(url)) return await ctx.reply('⚠️ Invalid URL');

		// Imports the character.
		const character = await ctx.bot.characters.import(ctx.author.id, url);

		if (argv.v) {
			console.log(character);
			await ctx.channel.send(new CharacterEmbed(character, ctx));
		}
	},
};