const ms = require('ms');
const { paginate } = require('../utils/Util');
const { confirm } = require('../Sebedius');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'stats',
	category: 'admin',
	description: 'Prints bot\'s statistics. Use argument `--clear` to erase the stats.',
	ownerOnly: true,
	guildOnly: false,
	args: false,
	usage: '[-clear]',
	/**
	 * @param {string[]} args Command's arguments
	 * @param {import('../utils/ContextMessage')} ctx Discord message with context
	 */
	async run(args, ctx) {
		const msg = await ctx.send(':1234: Fetching bot statistics...');
		const stats = await ctx.bot.getStats();

		// Counts the total.
		const total = stats.reduce((acc, n) => acc + n, 0);

		// Creates the message's content.
		const report = stats
			.sort((a, b) => b - a)
			.map((n, cmd) => `${cmd}: **${n}**`);

		// Paginates.
		const pages = paginate(report, report.length / 3);

		// Creates a Discord.MessageEmbed and sends it.
		const firstDay = ctx.bot.config.commands.stats.start;
		const dateDiff = Math.abs(Date.now() - new Date(firstDay));
		const embed = new MessageEmbed({
			color: msg.channel.type === 'DM' ? 0x0 : msg.member.displayColor,
			title: ':1234: Commands Statistics',
			description: 'This is the usage statistics for the bot\'s commands.'
				+ `\nNumber of servers the bot can see: **${ctx.bot.guilds.cache.size}**`,
			footer: { text: `Total: ${total} — Since: ${ms(dateDiff, true)}` },
		});

		for (const pg of pages) {
			embed.addField('==========', pg, true);
		}

		try {
			await msg.edit({ content: '', embeds: [embed] });
		}
		catch (err) { console.error(err); }

		if (args.includes('-clear')) {
			const text = ':speech_balloon:⚠️ Are you sure you want to **erase ALL stats**?'
				+ ' *(reply with yes/no)*';

			const clear = await confirm(ctx, text, true);
			if (clear) {
				await ctx.bot.kdb.stats.clear();
				await ctx.send(':broom: Database cleared.');
			}
		}
	},
};
