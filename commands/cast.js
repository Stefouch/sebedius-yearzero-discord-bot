const { getTable, emojifyRoll } = require('../Sebedius');
const { clamp, isNumber, rollD66, getValidLanguageCode } = require('../utils/Util');
const { YZEmbed } = require('../utils/embeds');
const YZRoll = require('../yearzero/YZRoll');

module.exports = {
	name: 'cast',
	aliases: ['magic'],
	category: 'fbl',
	description: 'Cast a spell. Use the `-mishap` parameter if you want a specific mishap.',
	guildOnly: false,
	args: true,
	usage: '<power> [name] [-mishap <value>] [-lang language_code]',
	async run(args, ctx) {
		// Parses the arguments.
		const argv = require('yargs-parser')(args, {
			array: ['name'],
			number: ['mishap'],
			string: ['lang'],
			alias: {
				name: ['n'],
				lang: ['lng', 'language'],
			},
			default: {
				name: ['Spell Casting'],
				mishap: null,
				lang: null,
			},
			configuration: ctx.bot.config.yargs,
		});
		// Validates the arguments.
		const basePowerLevel = Math.ceil(clamp(argv._.shift(), 1, 20));
		const name = argv._.join(' ') || argv.name.join(' ') || 'Spell Casting';
		const lang = await getValidLanguageCode(argv.lang, ctx);

		if (argv.mishap && !/[123456]{2}/.test(argv.mishap)) {
			return await ctx.reply('⚠️ Invalid Magic Mishap\'s reference!');
		}
		if (argv.mishap && !basePowerLevel) {
			return await ctx.bot.commands.get('mishap').run([argv.mishap], ctx);
		}
		if (!basePowerLevel || !isNumber(basePowerLevel)) {
			return await ctx.reply('⚠️ Invalid Power Level!');
		}

		// Rolls the Spell's Power Level (base dice).
		const magicRoll = new YZRoll('fbl', ctx.author, name)
			.addBaseDice(basePowerLevel);

		// Writes the description.
		let desc = `Base Power Level: **${basePowerLevel}**`;
		if (magicRoll.successCount > 0) {
			desc += `\nOvercharging: **+${magicRoll.successCount}**`;
		}
		const embed = new YZEmbed(magicRoll.name, desc, ctx, true);

		// Checks for Magic Mishaps.
		let ref;
		if (argv.mishap || magicRoll.baneCount) {
			const mishapTable = getTable('MAGIC_MISHAP', './gamedata/fbl/', 'fbl-magic-mishaps', lang, 'csv');
			ref = +argv.mishap || rollD66();
			const mishap = mishapTable.get(ref);
			embed.addField(`💥 Magic Mishap (${ref})`, mishap.effect.replace('{prefix}', ctx.prefix));
		}

		// Sends the message.
		await ctx.send(
			emojifyRoll(magicRoll, ctx.bot.config.commands.roll.options.fbl),
			embed,
		);
	},
};