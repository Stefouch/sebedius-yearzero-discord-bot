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
				v: false,
			},
			configuration: ctx.bot.config.yargs,
		});
		const url = argv._[0];

		// Exits early is the argument is not a valid URL.
		if (!URL_REGEX.test(url)) return await ctx.reply('⚠️ Invalid URL');

		const importInfoMsg = await ctx.channel.send('📥 Importing character...');

		// Imports the character.
		const character = await ctx.bot.characters.import(ctx.author.id, url);

		if (!character) {
			await importInfoMsg.edit(`❌ Could not retrieve character from ${url}`)
				.catch(console.error);
		}
		else {
			await importInfoMsg.edit(`✅ **${character.name}** was successfully imported!`)
				.catch(console.error);

			setTimeout(() => tryDelete(importInfoMsg), 3000);
		}

		if (argv.v) {
			console.log(character);
			await ctx.channel.send(new CharacterEmbed(character, ctx));
		}

		await tryDelete(ctx);
	},
};

/**
 * Tries to delete a message. Catches errors.
 * @param {*} message Message to delete
 * @async
 */
async function tryDelete(message) {
	try { await message.delete(); }
	catch (error) { console.error(error); }
}