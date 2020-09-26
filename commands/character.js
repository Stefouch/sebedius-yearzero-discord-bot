const Command = require('../utils/Command');
const { getSelection } = require('../Sebedius');
const { CharacterEmbed } = require('../utils/embeds');

module.exports = new class CharacterCommand extends Command {
	constructor() {
		super({
			name: 'character',
			aliases: ['char'],
			category: 'common',
			description: 'Manages your characters.',
			guildOnly: true,
			args: false,
			usage: '[subcommand]',
		});
	}

	/**
	 * @param {string[]} args Command's arguments
	 * @param {import('../utils/ContextMessage')} ctx Discord message with context
	 */
	async run(args, ctx) {
		const arg = (args[0] || '').toLowerCase();
		switch (arg) {
			case 'sheet': await characterSheet(ctx); break;
			case 'list': await characterList(ctx); break;
			case 'delete': case 'del': case 'remove': await characterDelete(ctx); break;
			case 'update': await characterUpdate(ctx, args[1] ? (args[1] === '-v' ? true : false) : false); break; // TODO
			default: await characterSwitch(ctx, arg);
		}

	}
};

/**
 * Switches the active character.
 * @param {import('../utils/ContextMessage')} ctx Discord message with context
 * @param {string} name The name of the character to switch
 * @async
 */
async function characterSwitch(ctx, name) {
	const characters = await ctx.bot.characters.store.get(ctx.author.id);
	if (!characters) return await ctx.reply('You have no character.');

	if (!name) {
		const activeCharacter = await ctx.bot.characters.fetch(ctx.author.id);
		return await ctx.reply(`Your currently active character is: **${activeCharacter.name}**`, { deleteAfter: 20 });
	}

	const selectedCharacter = getSelection(ctx, characters.map(c => [c.name, c]));
	await ctx.bot.characters.setActive(selectedCharacter);
	await tryDelete(ctx);
	await ctx.reply(`Your active character was changed to: **${selectedCharacter.name}**`, { deleteAfter: 20 });
}

/**
 * Prints the embed sheet of the currently active character.
 * @param {import('../utils/ContextMessage')} ctx Discord message with context
 * @async
 */
async function characterSheet(ctx) {
	const character = await ctx.bot.characters.fetch(ctx.author.id);
	return await ctx.channel.send(new CharacterEmbed(character, ctx));
}

/**
 * Lists the player's characters.
 * @param {import('../utils/ContextMessage')} ctx Discord message with context
 * @async
 */
async function characterList(ctx) {
	const characters = await ctx.bot.characters.store.get(ctx.author.id);
	if (!characters) return await ctx.reply('You have no character.');

	return await ctx.reply(
		'Your characters:\n'
		+ characters.map(c => c.name).sort().join(', ')
		+ '.',
	);
}

/**
 * Deletes a character.
 * @param {import('../utils/ContextMessage')} ctx Discord message with context
 * @async
 */
async function characterDelete(ctx) {
	// TODO
}

/**
 * Updates the current character sheet.
 * @param {import('../utils/ContextMessage')} ctx Discord message with context
 * @param {boolean} show Shows the character sheet after update
 * @async
 */
async function characterUpdate(ctx, show) {
	const oldCharacter = await ctx.bot.characters.fetch(ctx.author.id);
	if (!oldCharacter) return await ctx.reply('You have no character.');
	if (!oldCharacter.url) return await ctx.reply('Cannot find the URL of the active character.');
	// TODO
}

/**
 * Tries to delete a message. Catches errors.
 * @param {*} message Message to delete
 * @async
 */
async function tryDelete(message) {
	try { await message.delete(); }
	catch (error) { console.error(error); }
}