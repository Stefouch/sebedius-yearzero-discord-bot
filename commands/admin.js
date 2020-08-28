const ms = require('ms');
const os = require('os');
const worker = require('core-worker');
const { version } = require('discord.js');
const { YZEmbed } = require('../utils/embeds');

module.exports = {
	name: 'admin',
	group: 'Administration',
	description: 'Performs bot\'s maintenance. Only available for the bot\'s owner.',
	adminOnly: true,
	guildOnly: true,
	args: true,
	usage: '',
	async execute(args, ctx) {
		// Exits early if not the bot's owner.
		if (ctx.author.id !== ctx.bot.config.ownerID) return;

		// Lists servers the bot is connected to
		// and updates the bot's activity according to the updated value.
		if (args.includes('servers') || args.includes('serv')) {
			const guilds = [];
			ctx.bot.guilds.cache.forEach(guild => {
				guilds.push(`* ${guild.name} (${guild.id}) m: ${guild.memberCount}`);
			});
			await ctx.author.send(`List of guilds:\n${guilds.join('\n')}`, { split: true });
		}
		// Gets info from the Bot.
		else if (args.includes('botinfo')) {
			try {
				const npmv = await worker.process('npm -v').death();
				const stats = new YZEmbed()
					.setTitle('`Sebedius Statistics`')
					.addField('Memory Usage', `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, true)
					.addField('Swap Partition Size', `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`, true)
					.addField('Uptime', ms(ctx.bot.uptime), true)
					.addField('Users', ctx.bot.users.cache.size, true)
					.addField('Servers', ctx.bot.guilds.cache.size, true)
					.addField('Channels', ctx.bot.channels.cache.size, true)
					.addField('Emojis', ctx.bot.emojis.cache.size, true)
					.addField('Library', 'discord.js', true)
					.addField('Library Version', `v${version}`, true)
					.addField('Bot Created', ctx.bot.user.createdAt, true)
					.addField('Node Version', process.version, true)
					.addField('NPM Version', npmv.data.replace('\n', ''), true)
					.addField('OS', `${os.platform()} (${process.arch})`, true)
					.setTimestamp();
				await ctx.channel.send(stats);
			}
			catch (err) {
				console.error('Botinfo Error', err);
			}
		}
		else {
			await ctx.reply('Hello! Please give me a subcommand.');
		}
	},
};