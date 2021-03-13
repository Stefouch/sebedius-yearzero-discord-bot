const Command = require('../utils/Command');
const { confirm, getSelection, tryDelete } = require('../Sebedius');
const { CharacterEmbed } = require('../utils/embeds');

module.exports = new class CharacterCommand extends Command {
	constructor() {
		super({
			name: 'character',
			aliases: ['char'],
			category: 'common',
			description: 'ccharacter-description',
			moreDescriptions: 'ccharacter-moredescriptions',
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
		const argv = require('yargs-parser')(args, {
			boolean: ['v'],
			default: {
				v: false,
			},
			configuration: ctx.bot.config.yargs,
		});

		const arg = (argv._[0] || '').toLowerCase();
		switch (arg) {
			case 'sheet': await characterSheet(ctx); break;
			case 'list': await characterList(ctx); break;
			case 'update': await characterUpdate(ctx, argv.v); break;
			case 'delete': case 'del': case 'remove': await characterDelete(ctx); break;
			default: await characterSwitch(ctx, arg);
		}
		await tryDelete(ctx);
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

	const selectedCharacter = await getSelection(ctx, characters.map(c => [c.name, c]));
	await ctx.bot.characters.setActive(selectedCharacter);
	await ctx.reply(`Your active character was changed to: **${selectedCharacter.name}**`, { deleteAfter: 20 });

	return selectedCharacter;
}

/**
 * Prints the embed sheet of the currently active character.
 * @param {import('../utils/ContextMessage')} ctx Discord message with context
 * @async
 */
async function characterSheet(ctx) {
	const character = await ctx.bot.characters.fetch(ctx.author.id);
	if (!character) return await ctx.reply('You have no active character.');

	return await ctx.send(new CharacterEmbed(character, ctx));
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
		`Your character${characters.length > 1 ? 's' : ''}:\n`
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
	const characters = await ctx.bot.characters.store.get(ctx.author.id);
	if (!characters) return await ctx.reply('You have no character.');

	const selectedCharacter = await getSelection(ctx, characters.map(c => [`${c.name} (${c.id})`, c]));

	const confirmation = await confirm(ctx, `⚠️ Are you sure you want to delete **${selectedCharacter.name}**? *(Reply with yes/no)*`, true);

	if (confirmation) {
		const deleted = await ctx.bot.characters.delete(ctx.author.id, selectedCharacter.id);
		if (deleted) return await ctx.send(`🧼 Character **${selectedCharacter.name}** has been deleted.`);
	}
	return await ctx.send('❌ No character was deleted.', { deleteAfter: 20 });
}

/**
 * Updates the current character sheet.
 * @param {import('../utils/ContextMessage')} ctx Discord message with context
 * @param {boolean} [show=false] Whether to show the character sheet after update
 * @async
 */
async function characterUpdate(ctx, show = false) {
	const oldCharacter = await ctx.bot.characters.fetch(ctx.author.id);
	if (!oldCharacter) return await ctx.reply('You have no character.');
	if (!oldCharacter.url) return await ctx.reply('Cannot find the URL of the active character.');

	// TODO
	const args = [oldCharacter.url];
	if (show) args.push('-v');
	return await ctx.bot.commands.get('importcharacter').run(args, ctx);
}