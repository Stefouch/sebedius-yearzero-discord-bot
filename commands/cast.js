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
		const basePowerLevel = +argv._[0];
		const magicRoll = new YZRoll(
			ctx.author,
			{ base: basePowerLevel },
			'Magic',
		);
		magicRoll.setGame('fbl');

		const hasOvercharged = magicRoll.sixes > 0;
		const finalPowerLevel = basePowerLevel + magicRoll.sixes;

		const desc = `Base Power Level: **${basePowerLevel}**`
			+ (hasOvercharged ? `\nOvercharging: **+${magicRoll.sixes}**` : '');

		const embed = new YZEmbed(magicRoll.title, desc, ctx, true);

		let ref;
		if (argv.mishap || magicRoll.banes) {
			const mishapTable = ctx.bot.getTable('MAGIC_MISHAP', './gamedata/fbl/', 'fbl-magic-mishaps', 'en', 'csv');
			ref = argv.mishap || Util.rollD66();
			const mishap = mishapTable.get(ref);
			embed.addField('Magic Mishap', mishap.effect);
		}

		// Sends the message.
		await ctx.channel.send(
			Sebedius.emojifyRoll(magicRoll, ctx.bot.config.commands.roll.options.fbl),
			embed,
		);

		if (ref === 56) {
			await ctx.bot.commands.get('critfbl').execute(['bl'], ctx);
		}
	},
};