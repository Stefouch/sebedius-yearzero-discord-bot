const { getTable } = require('../Sebedius');
const { rollD66 } = require('../utils/Util');
const { YZEmbed } = require('../utils/embeds');

module.exports = {
	name: 'mishap',
	category: 'fbl',
	description: 'Draws a random Magic Mishap.',
	guildOnly: false,
	args: false,
	usage: '[reference]',
	async run(args, ctx) {
		if (args[0] && !/[123456]{2}/.test(args[0])) {
			return await ctx.reply(':warning: Invalid Magic Mishap\'s reference!');
		}
		const mishapTable = getTable('MAGIC_MISHAP', './gamedata/fbl/', 'fbl-magic-mishaps', 'en', 'csv');
		const ref = +args[0] || rollD66();
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