const ms = require('ms');
const Util = require('../utils/Util');
const Sebedius = require('../Sebedius');
const { MessageEmbed } = require('discord.js');

const FIRST_DAY = '2020-07-02';

module.exports = {
	name: 'stats',
	group: 'Administration',
	description: 'Prints bot\'s statistics. Use argument `--clear` to erase the stats.',
	adminOnly: true,
	guildOnly: false,
	args: false,
	usage: '[--clear]',
	async execute(args, ctx) {
		const msg = await ctx.channel.send(':1234: Fetching bot statistics...');
		const stats = await ctx.bot.getStats();

		// Counts the total.
		const total = stats.reduce((acc, n) => acc + n, 0);

		// Creates the message's content.
		const report = stats
			.sort((a, b) => b - a)
			.map((n, cmd) => `${cmd}: **${n}**`);

		// Paginates.
		const pages = Util.paginate(report, report.length / 3);

		// Creates a Discord.MessageEmbed and sends it.
		const dateDiff = Math.abs(Date.now() - new Date(FIRST_DAY));
		const embed = new MessageEmbed()
			.setTitle(':1234: Commands Statistics')
			.setDescription('This is the usage statistics for the bot\'s commands.')
			.setColor(msg.channel.type === 'dm' ? 0x0 : msg.member.displayColor)
			.setFooter(`Total: ${total} — Since: ${ms(dateDiff, true)}`);

		for (const pg of pages) {
			embed.addField('==========', pg, true);
		}

		try {
			await msg.edit({ content: '', embed });
		}
		catch (err) { console.error(err); }

		if (args.includes('--clear')) {
			const text = ':speech_balloon::warning: Are you sure you want to **erase ALL stats**?'
				+ ' *(reply with yes/no)*';

			const clear = await Sebedius.confirm(ctx, text, true);
			if (clear) {
				await ctx.bot.kdb.stats.clear();
			}
		}
	},
};