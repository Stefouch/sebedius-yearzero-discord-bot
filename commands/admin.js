const ms = require('ms');
const os = require('os');
const worker = require('core-worker');
const { version, MessageMentions } = require('discord.js');
const { YZEmbed, UserEmbed, GuildEmbed } = require('../utils/embeds');

module.exports = {
	name: 'admin',
	category: 'admin',
	description: 'Performs bot\'s maintenance. Only available for the bot\'s owner.',
	ownerOnly: true,
	guildOnly: false,
	args: true,
	usage: '',
	async run(args, ctx) {
		// Exits early if not the bot's owner.
		if (ctx.author.id !== ctx.bot.owner.id) return;

		await ctx.delete().catch(console.error);

		if (args.length >= 2) {
			switch (args[0]) {
				case 'mute': case 'ban': return await mute(ctx, args[1]);
				case 'unmute': case 'unban': return await unmute(ctx, args[1]);
				case 'blacklist': return await blacklist(ctx, args[1]);
				case 'whitelist': return await whitelist(ctx, args[1]);
				case 'leave': return await leave(ctx, args[1]);
				case 'whois': case 'userinfo': return await whois(ctx, args[1]);
				case 'serverinfo': return await guildInfo(ctx, args[1]);
				case 'chansay': {
					args.shift();
					const channel = args.shift();
					const message = args.join(' ');
					return await chanSay(ctx, channel, message);
				}
			}
		}
		else {
			switch (args[0]) {
				case 'reload': return botReload();
				case 'botinfo': case 'info': return await botInfo(ctx);
				case 'servers': return await listGuilds(ctx);
			}
		}
		return await ctx.reply('Hello! Please give me a subcommand.');
	},
};

/**
 * Reloads the bot.
 * @async
 */
async function botReload() {
	// process.exit();
}

/**
 * Blacklists a guild.
 * @param {Discord.message} ctx Discord message with context
 * @param {Snowflake} guildId Guild ID
 * @async
 */
async function blacklist(ctx, guildId) {
	ctx.bot.blacklistedGuilds.add(guildId);
	const resp = await ctx.bot.kdb.blacklistedGuilds.set(guildId, 1);
	const msg = resp
		? `✅ Server "${guildId}" has been blacklisted.`
		: '❌ An error occured.';
	return await ctx.reply(msg);
}

async function whitelist(ctx, guildId) {
	ctx.bot.blacklistedGuilds.delete(guildId);
	const resp = await ctx.bot.kdb.blacklistedGuilds.delete(guildId);
	const msg = resp
		? `✅ Server "${guildId}" has been removed from the blacklist.`
		: `❌ Server "${guildId}" is not blacklisted.`;
	return await ctx.reply(msg);
}

/**
 * Sends a message to a channel.
 * @param {Discord.message} ctx Discord message with context
 * @param {Snowflake} chanId Channel ID
 * @param {string} message Message to send
 * @async
 */
async function chanSay(ctx, chanId, message) {
	const chan = await ctx.bot.getChannel(chanId);
	if (!chan) return await ctx.reply('❌ Channel not found');
	const resp = await chan.send(message);
	const msg = resp
		? '✅ Message sent.'
		: '❌ Message not sent.';
	return await ctx.reply(msg);
}

/**
 * Prints info from a user.
 * @param {Discord.message} ctx Discord message with context
 * @param {Snowflake} userId User ID or user's mention
 * @async
 */
async function whois(ctx, userId) {
	let user;
	if (MessageMentions.USERS_PATTERN.test(userId)) {
		user = ctx.mentions.users.first();
	}
	else {
		user = await ctx.bot.getUser(userId);
	}
	if (!user) return await ctx.reply('❌ User not found.');
	const embed = new UserEmbed(user);
	return await ctx.send(embed);
}

/**
 * Prints info from a guild.
 * @param {Discord.message} ctx Discord message with context
 * @param {Snowflake} guildId Guild ID
 * @async
 */
async function guildInfo(ctx, guildId) {
	const guild = await ctx.bot.getGuild(guildId);
	const embed = new GuildEmbed(guild);
	// await embed.addInviteField();
	return ctx.send(embed);
}

/**
 * Forces the bot to leave the guild.
 * @param {Discord.message} ctx Discord message with context
 * @param {Snowflake} guildId Guild ID
 * @async
 */
async function leave(ctx, guildId) {
	const guild = await ctx.bot.getGuild(guildId);
	if (!guild) return false;
	const resp = await guild.leave();
	const msg = resp
		? `✅ Left guild **${guild.name}**`
		: '❌ An error occured.';
	return await ctx.reply(msg);
}

/**
 * Bans/mutes a user.
 * @param {Discord.message} ctx Discord message with context
 * @param {Snowflake} userId User ID
 * @async
 */
async function mute(ctx, userId) {
	ctx.bot.mutedUsers.add(userId);
	const resp = await ctx.bot.kdb.mutedUsers.set(userId);
	const msg = resp
		? `✅ User **${userId}** has been banned.`
		: `❌ User **${userId}** was not banned.`;
	return await ctx.reply(msg);
}

/**
 * Unbans/unmutes a user.
 * @param {Discord.message} ctx Discord message with context
 * @param {Snowflake} userId User ID
 * @async
 */
async function unmute(ctx, userId) {
	ctx.bot.mutedUsers.delete(userId);
	const resp = await ctx.bot.kdb.mutedUsers.delete(userId);
	const msg = resp
		? `✅ User **${userId}** has been unbanned.`
		: '❌ An error occured.';
	return await ctx.reply(msg);
}


/**
 * Prints the list of all servers.
 * @param {Discord.Message} ctx Discord message with context
 * @async
 */
async function listGuilds(ctx) {
	const guilds = ['List of guilds:'];
	ctx.bot.guilds.cache.forEach(g => {
		guilds.push(`${g.id}\t${g.name}\t${g.memberCount}`);
	});
	console.log(guilds.toString());
}

/**
 * Prints info from the bot.
 * @param {Discord.Message} ctx Discord message with context
 * @async
 */
async function botInfo(ctx) {
	try {
		const npmv = await worker.process('npm -v').death();
		const stats = new YZEmbed()
			.setTitle('`Sebedius Statistics`')
			.addField('Memory Usage', `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, true)
			.addField('Swap Partition Size', `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`, true)
			.addField('Uptime', ms(ctx.bot.uptime), true)
			// .addField('Users', ctx.bot.users.cache.size, true)
			.addField('Users', ctx.bot.guilds.cache.reduce((sum, g) => sum + g.memberCount, 0), true)
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
		await ctx.send(stats);
	}
	catch (err) {
		console.error('Botinfo Error', err);
	}
}

/**
 * A Discord snowflake.
 * @typedef {string} Snowflake
 */