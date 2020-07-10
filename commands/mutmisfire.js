const Sebedius = require('../Sebedius');
const Util = require('../utils/Util');
const YZEmbed = require('../utils/embeds');
const YZRoll = require('../yearzero/YZRoll');

module.exports = {
	name: 'mutmisfire',
	group: 'Mutant: Year Zero',
	description: 'Rolls the dice for a mutation.',
	aliases: ['misfire'],
	guildOnly: false,
	args: true,
	usage: '<points>',
	async execute(args, ctx) {
		// Parses the arguments.
		const argv = require('yargs-parser')(args, {
			array: ['name'],
			number: ['mishap'],
			alias: {
				name: ['n'],
			},
			default: {
				name: ['Spell Casting'],
				mishap: null,
			},
			configuration: ctx.bot.config.yargs,
		});
		// Validates the arguments.
		const basePowerLevel = Math.ceil(Util.clamp(argv._[0], 1, 20));
		const name = argv.name.join(' ');

		if (argv.mishap && !/[123456]{2}/.test(argv.mishap)) {
			return await ctx.reply(':warning: Invalid Magic Mishap\'s reference!');
		}
		if (argv.mishap && !basePowerLevel) {
			return await ctx.bot.commands.get('mishap').execute([argv.mishap], ctx);
		}
		if (!basePowerLevel || !Util.isNumber(basePowerLevel)) {
			return await ctx.reply(':warning: Invalid Power Level!');
		}

		// Rolls the Spell's Power Level (base dice).
		const magicRoll = new YZRoll(
			ctx.author,
			{ base: basePowerLevel },
			name,
		);
		magicRoll.setGame('fbl');

		// Writes the description.
		let desc = `Base Power Level: **${basePowerLevel}**`;
		if (magicRoll.sixes > 0) {
			desc += `\nOvercharging: **+${magicRoll.sixes}**`;
		}
		const embed = new YZEmbed(magicRoll.title, desc, ctx, true);

		// Checks for Magic Mishaps.
		let ref;
		if (argv.mishap || magicRoll.banes) {
			const mishapTable = Sebedius.getTable('MAGIC_MISHAP', './gamedata/fbl/', 'fbl-magic-mishaps', 'en', 'csv');
			ref = +argv.mishap || Util.rollD66();
			const mishap = mishapTable.get(ref);
			embed.addField(`💥 Magic Mishap (${ref})`, mishap.effect.replace('{prefix}', ctx.prefix));
		}

		// Sends the message.
		await ctx.channel.send(
			Sebedius.emojifyRoll(magicRoll, ctx.bot.config.commands.roll.options.fbl),
			embed,
		);
	},
};