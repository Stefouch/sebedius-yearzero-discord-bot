const { YZEmbed } = require('../utils/embeds');

module.exports = {
	name: 'prefix',
	group: 'Other',
	description: 'Gets the prefixes for this server. Sets a new one with the option `set`.',
	guildOnly: false,
	args: false,
	usage: '[set <new prefix>]',
	async execute(args, ctx) {
		if (args.length > 0) {
			if (args[0].toLowerCase() === 'set' && args.length === 2) {
				return await ctx.bot.commands.get('setconf').execute(['prefix', args[1]], ctx);
			}
			else {
				return await ctx.reply(
					':information_source: Invalid arguments. '
					+ `The proper usage would be \`${ctx.prefix}prefix ${module.exports.usage}\`.`,
				);
			}
		}
		const msg = `1. ${ctx.bot.mention}\n2. ${ctx.prefix}`;
		const embed = new YZEmbed('Sebedius Prefixes', msg).setFooter('2 prefixes');
		return await ctx.channel.send(embed);
	},
};