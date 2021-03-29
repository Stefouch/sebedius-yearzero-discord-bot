const Command = require('../utils/Command');
const { confirm, getSelection, tryDelete } = require('../Sebedius');
const { CharacterEmbed } = require('../utils/embeds');
const { __ } = require('../lang/locales');

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

		const arg = (argv._[0] || '').toLowerCase();
		switch (arg) {
			case 'sheet': await characterSheet(ctx, lang); break;
			case 'list': await characterList(ctx, lang); break;
			case 'update': await characterUpdate(ctx, argv.v, lang); break;
			case 'delete': case 'del': case 'remove': await characterDelete(ctx, lang); break;
			default: await characterSwitch(ctx, arg, lang);
		}
		await tryDelete(ctx);
	}
};

/**
 * Switches the active character.
 * @param {import('../utils/ContextMessage')} ctx Discord message with context
 * @param {string} name The name of the character to switch
 * @param {string} lang The language code to be used
 * @async
 */
async function characterSwitch(ctx, name, lang = 'en') {
	const characters = await ctx.bot.characters.store.get(ctx.author.id);
	if (!characters) return await ctx.reply(__('ccharacter-no-character', lang));

	if (!name) {
		const activeCharacter = await ctx.bot.characters.fetch(ctx.author.id);
		return await ctx.reply(`${__('ccharacter-active-character', lang)}: **${activeCharacter.name}**`, { deleteAfter: 20 });
	}

	const selectedCharacter = await getSelection(ctx, characters.map(c => [c.name, c]));
	await ctx.bot.characters.setActive(selectedCharacter);
	await ctx.reply(`${__('ccharacter-active-changed-to', lang)}: **${selectedCharacter.name}**`, { deleteAfter: 20 });

	return selectedCharacter;
}

/**
 * Prints the embed sheet of the currently active character.
 * @param {import('../utils/ContextMessage')} ctx Discord message with context
 * @param {string} lang The language code to be used
 * @async
 */
async function characterSheet(ctx, lang = 'en') {
	const character = await ctx.bot.characters.fetch(ctx.author.id);
	if (!character) return await ctx.reply(__('ccharacter-no-active-character', lang));

	return await ctx.send(new CharacterEmbed(character, ctx));
}

/**
 * Lists the player's characters.
 * @param {import('../utils/ContextMessage')} ctx Discord message with context
 * @param {string} lang The language code to be used
 * @async
 */
async function characterList(ctx, lang = 'en') {
	const characters = await ctx.bot.characters.store.get(ctx.author.id);
	if (!characters) return await ctx.reply(__('ccharacter-no-character', lang));

	return await ctx.reply(
		`${__('ccharacter-your-character' + (characters.length > 1 ? 's' : ''), lang)}:\n`
		+ characters.map(c => c.name).sort().join(', ')
		+ '.',
	);
}

/**
 * Deletes a character.
 * @param {import('../utils/ContextMessage')} ctx Discord message with context
 * @param {string} lang The language code to be used
 * @async
 */
async function characterDelete(ctx, lang = 'en') {
	// TODO
	const characters = await ctx.bot.characters.store.get(ctx.author.id);
	if (!characters) return await ctx.reply(__('ccharacter-no-character', lang));

	const selectedCharacter = await getSelection(ctx, characters.map(c => [`${c.name} (${c.id})`, c]));

	const confirmation = await confirm(ctx, `⚠️ ${__('ccharacter-delete-confirmation', lang).replace('{character_name}', selectedCharacter.name)}`, true);

	if (confirmation) {
		const deleted = await ctx.bot.characters.delete(ctx.author.id, selectedCharacter.id);
		if (deleted) return await ctx.send(`🧼 ${__('ccharacter-delete-confirmation', lang).replace('{character_name}', selectedCharacter.name)}`);
	}
	return await ctx.send(`❌ ${__('ccharacter-deleted-none', lang)}`, { deleteAfter: 20 });
}

/**
 * Updates the current character sheet.
 * @param {import('../utils/ContextMessage')} ctx Discord message with context
 * @param {boolean} [show=false] Whether to show the character sheet after update
 * @param {string} lang The language code to be used
 * @async
 */
async function characterUpdate(ctx, show = false, lang = 'en') {
	const oldCharacter = await ctx.bot.characters.fetch(ctx.author.id);
	if (!oldCharacter) return await ctx.reply(__('ccharacter-no-character', lang));
	if (!oldCharacter.url) return await ctx.reply(__('ccharacter-cannot-find-url', lang));

	// TODO
	const args = [oldCharacter.url];
	if (show) args.push('-v');
	return await ctx.bot.commands.get('importcharacter').run(args, ctx);
}