const { getTable, emojifyRoll } = require('../Sebedius');
const { clamp, rand } = require('../utils/Util');
const { YZEmbed } = require('../utils/embeds');
const YZRoll = require('../yearzero/YZRoll');
const { __ } = require('../lang/locales');

const tableNames = {
	myz: 'myz-mp-misfires',
	gla: 'gla-fp-feraleffects',
	mek: 'mek-ep-overheatings',
	ely: 'ely-ip-backlashes',
};

const titles = {
	myz: 'mutation-misfire',
	gla: 'animal-power-feral-effect',
	mek: 'module-overheating',
	ely: 'contact-backlash',
};

module.exports = {
	name: 'myzpower',
	category: 'myz',
	description: 'cmyzpower-description',
	guildOnly: false,
	args: true,
	usage: '<myz|gla|mek|ely> <power> [-lang <language_code>]',
	async run(args, ctx) {
		// Parses arguments.
		const argv = require('yargs-parser')(args, {
			string: ['lang'],
			alias: {
				lang: ['lng', 'language'],
			},
			default: {
				lang: null,
			},
			configuration: ctx.bot.config.yargs,
		});
		const lang = await ctx.bot.getValidLanguageCode(argv.lang, ctx);
		// Parses arguments.
		const book = argv._[0].toLowerCase();
		const power = clamp(argv._[1], 1, 10);

		// Validates arguments.
		if (!tableNames.hasOwnProperty(book) || !power) {
			return await ctx.reply(`⚠️ ${__('cmyzpower-invalid-arguments', lang)}!`);
		}

		// Rolls the dice.
		const roll = new YZRoll('myz', ctx.author, __(titles[book], lang), lang)
			.addDice(book === 'mek' ? 'gear' : 'base', power);

		// Checks for misfires / feral effects / overheatings / backlashes.
		let embed;
		if (roll.baneCount > 0) {
			const table = getTable(null, './gamedata/myz/', tableNames[book], lang, 'csv');
			const ref = rand(1, 6);
			const entry = table.get(ref);
			embed = new YZEmbed(`💥 ${roll.name} (${ref})`, entry.effect, ctx, true);
		}

		return await ctx.send({
			content: emojifyRoll(roll, ctx.bot.config.commands.roll.options.myz),
			embeds: [embed],
		});
	},
};
