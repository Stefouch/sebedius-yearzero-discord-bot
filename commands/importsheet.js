const { CharacterEmbed } = require('../utils/embeds');

module.exports = {
	name: 'importsheet',
	aliases: ['import'],
	category: 'common',
	description: 'Imports a character sheet',
	guildOnly: true,
	args: true,
	usage: '<url>',
	/**
	 * @param {string[]} args Command's arguments
	 * @param {import('../utils/ContextMessage')} ctx Discord message with context
	 */
	async run(args, ctx) {
		const character = await ctx.bot.characters.import(ctx.author.id, args[0]);

		// if (args[1] === '-show') {
			console.log(character);
			await ctx.send(new CharacterEmbed(character, ctx));
		// }
	},
};