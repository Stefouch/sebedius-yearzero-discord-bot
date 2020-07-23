const Sebedius = require('../Sebedius');
const Util = require('../utils/Util');
const { YZEmbed } = require('../utils/embeds');
const YZRoll = require('../yearzero/YZRoll');

const tableNames = {
	myz: 'myz-mp-misfires',
	gla: 'gla-fp-feraleffects',
	mec: 'mec-ep-overheatings',
	ely: 'ely-ip-backlashes',
};

const titles = {
	myz: 'Mutation Misfire',
	gla: 'Animal Power Feral Effect',
	mec: 'Module Overheating',
	ely: 'Contact Backlash',
};

module.exports = {
	name: 'myzpower',
	group: 'Mutant: Year Zero',
	description: 'Rolls the dice for a MYZ power.',
	guildOnly: false,
	args: true,
	usage: '<myz|gla|mec|ely> <power>',
	async execute(args, ctx) {
		// Parses arguments.
		const book = args[0];
		const power = Util.clamp(args[1], 1, 10);

		// Validates arguments.
		if (!tableNames.hasOwnProperty(book) || !power) {
			return await ctx.reply(':warning: Invalid arguments!');
		}

		// Rolls the dice.
		const type = book === 'mec' ? 'gear' : 'base';
		const roll = new YZRoll(ctx.author, { [type]: power }, titles[book]);
		roll.setGame('myz');

		// Checks for misfires / feral effects / overheatings / backlashes.
		let embed;
		if (roll.banes > 0) {
			const table = Sebedius.getTable(null, './gamedata/myz/', tableNames[book], 'en', 'csv');
			const ref = Util.rand(1, 6);
			const entry = table.get(ref);
			embed = new YZEmbed(`💥 ${roll.title} (${ref})`, entry.effect, ctx, true);
		}

		return await ctx.channel.send(
			Sebedius.emojifyRoll(roll, ctx.bot.config.commands.roll.options.myz),
			embed,
		);
	},
};