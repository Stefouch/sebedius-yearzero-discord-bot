const Sebedius = require('../Sebedius');
const Util = require('../utils/Util');
const { YZEmbed } = require('../utils/embeds');
const YZRoll = require('../yearzero/YZRoll');

module.exports = {
	name: 'mishap',
	group: 'Forbidden Lands',
	description: 'Draws a random Magic Mishap.',
	guildOnly: false,
	args: false,
	usage: '[reference]',
	async execute(args, ctx) {
		if (args[0] && !/[123456]{2}/.test(args[0])) {
			return await ctx.reply(':warning: Invalid Magic Mishap\'s reference!');
		}
		const mishapTable = Sebedius.getTable('MAGIC_MISHAP', './gamedata/fbl/', 'fbl-magic-mishaps', 'en', 'csv');
		const ref = +args[0] || Util.rollD66();
		const mishap = mishapTable.get(ref);

		const embed = new YZEmbed(
			`Magic Mishap (${ref})`,
			mishap.effect.replace('{prefix}', ctx.prefix),
			ctx,
			true,
		);
		return await ctx.channel.send(embed);
	},
};