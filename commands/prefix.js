const YZEmbed = require('../utils/embeds');

module.exports = {
	name: 'prefix',
	group: 'Core',
	description: 'Gets the prefixes for this server.',
	guildOnly: false,
	args: false,
	usage: '[new prefix]',
	async execute(args, ctx) {
		if (args.length) {
			return await ctx.bot.commands.get('setconf').execute(['prefix', args[0]], ctx);
		}
		const msg = `1. ${ctx.bot.mention}\n2. ${ctx.prefix}`;
		const embed = new YZEmbed('Sebedius Prefixes', msg).setFooter('2 prefixes');
		return await ctx.channel.send(embed);
	},
};