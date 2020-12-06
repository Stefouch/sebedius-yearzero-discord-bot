const { getTable, emojifyRoll } = require('../Sebedius');
const { clamp, rand } = require('../utils/Util');
const { YZEmbed } = require('../utils/embeds');
const YZRoll = require('../yearzero/YZRoll');

const tableNames = {
	myz: 'myz-mp-misfires',
	gla: 'gla-fp-feraleffects',
	mek: 'mek-ep-overheatings',
	ely: 'ely-ip-backlashes',
};

const titles = {
	myz: 'Mutation Misfire',
	gla: 'Animal Power Feral Effect',
	mek: 'Module Overheating',
	ely: 'Contact Backlash',
};

module.exports = {
	name: 'myzpower',
	category: 'myz',
	description: 'Rolls the dice for a MYZ power.',
	guildOnly: false,
	args: true,
	usage: '<myz|gla|mek|ely> <power>',
	async run(args, ctx) {
		// Parses arguments.
		const book = args[0].toLowerCase();
		const power = clamp(args[1], 1, 10);

		// Validates arguments.
		if (!tableNames.hasOwnProperty(book) || !power) {
			return await ctx.reply('⚠️ Invalid arguments!');
		}

		// Rolls the dice.
		const roll = new YZRoll('myz', ctx.author, titles[book])
			.addDice(book === 'mek' ? 'gear' : 'base', power);

		// Checks for misfires / feral effects / overheatings / backlashes.
		let embed;
		if (roll.baneCount > 0) {
			const table = getTable(null, './gamedata/myz/', tableNames[book], 'en', 'csv');
			const ref = rand(1, 6);
			const entry = table.get(ref);
			embed = new YZEmbed(`💥 ${roll.name} (${ref})`, entry.effect, ctx, true);
		}

		return await ctx.send(
			emojifyRoll(roll, ctx.bot.config.commands.roll.options.myz),
			embed,
		);
	},
};