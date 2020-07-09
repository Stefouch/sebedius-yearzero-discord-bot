const Sebedius = require('../Sebedius');
const Util = require('../utils/Util');
const YZEmbed = require('../utils/embeds');
const YZRoll = require('../yearzero/YZRoll');

module.exports = {
	name: 'cast',
	group: 'Forbidden Lands',
	description: 'Cast a spell.',
	guildOnly: false,
	args: true,
	usage: '<basePowerLevel> [-name|-n <name>] [-mishap <value>]',
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
		const basePowerLevel = +argv._[0];
		const name = argv.name.join(' ');

		// Checks the Base Power Level.
		if (!basePowerLevel || !Util.isNumber(basePowerLevel)) {
			return await ctx.reply(':warning: Invalid Power Level');
		}

		// Rolls the Spell's Power Level (base dice).
		const magicRoll = new YZRoll(
			ctx.author,
			{ base: basePowerLevel },
			name,
		);
		magicRoll.setGame('fbl');

		const hasOvercharged = magicRoll.sixes > 0;

		// Writes the description.
		let desc = `Base Power Level: **${basePowerLevel}**`;
		if (hasOvercharged) {
			desc += `\nOvercharging: **+${magicRoll.sixes}**`;
		}
		const embed = new YZEmbed(magicRoll.title, desc, ctx, true);

		// Checks Magic Mishaps.
		let ref;
		if (argv.mishap || magicRoll.banes) {
			const mishapTable = Sebedius.getTable('MAGIC_MISHAP', './gamedata/fbl/', 'fbl-magic-mishaps', 'en', 'csv');
			ref = +argv.mishap || Util.rollD66();
			const mishap = mishapTable.get(ref);
			embed.addField(`💥 Magic Mishap (${ref})`, mishap.effect);
		}

		// Sends the message.
		await ctx.channel.send(
			Sebedius.emojifyRoll(magicRoll, ctx.bot.config.commands.roll.options.fbl),
			embed,
		);

		// Extras.
		/*
		if (ref >= 52 && ref <= 55) {
			await ctx.bot.commands.get('critfbl').execute(['h'], ctx);
		}
		else if (ref === 56) {
			await ctx.bot.commands.get('critfbl').execute(['bl'], ctx);
		}//*/
	},
};