/* eslint-disable no-unused-vars */

const { describe, it, beforeEach, afterEach } = require('mocha');
const expect = require('chai').expect;
const sinon = require('sinon');
const Discord = require('discord.js');
const Sebedius = require('../Sebedius');
const ContextMessage = require('../utils/ContextMessage');

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

describe('Discord Bot Client', function() {
	// this.slow(500);
	this.timeout(5000);
	// this.retries(3);

	// const token = process.env.TOKEN;
	const bot = new Sebedius(require('../config.json'));
	bot.user = {
		id: bot.config.betaBotID,
	},
	bot.muted = true;
	bot.state = 'ready',
	bot.owner = new Discord.User(bot, {
		username: 'BotOwner',
		discriminator: '1234',
		id: bot.config.ownerID,
	});
	bot.users.cache.set(bot.owner.id, bot.owner);

	it('Sebedius is successfully created', function() {
		expect(bot.config.defaultPrefix).to.equal('!');
		expect(bot.id).to.equal(bot.config.betaBotID);
		expect(bot.owner.id).to.equal(bot.config.ownerID);
	});

	describe('# Check each command', function() {
		const sandbox = sinon.createSandbox();
		let ctx;

		beforeEach(function() {
			// Creates a Discord message with context (CTX).
			const message = createFakeDiscordMessage(bot);
			ctx = Sebedius.processMessage(message, '!');

			// Creates a SinonJS Spy.
			// sandbox.spy(ctx, 'send');
		});

		afterEach(function() {
			// sandbox.restore();
		});

		for (const [cmdName, cmd] of bot.commands) {

			it(`Command: ${cmdName}`, function() {
				expect(cmd.name).to.equal(cmdName);
				expect(cmd.category).to.be.a('string').with.length.greaterThan(0);
				expect(cmd.description).to.be.a('string').with.length.greaterThan(0);

				let args = [''];
				if (cmdName.startsWith('roll')) args = ['5b3s2g'];
				else if (cmdName === 'journey') args = ['create', 'summer', '-fbr'];

				// cmd.run(args, ctx).then((response) => {
				// 	console.log(response);
				// 	expect(response).to.be.a('Discord.Message');
				// 	done();
				// });
			});
		}
	});
});

function createFakeDiscordMessage(client) {
	const guildID = Discord.SnowflakeUtil.generate();
	// Creates a fake Discord Guild/Server.
	const guild = new Discord.Guild(client, {
		name: 'Fake Guild',
		id: guildID,
		type: 0,
		owner_id: client.user.id,
	});
	guild.roles.cache.set(guild.id, new Discord.Role(
		client,
		{
			name: 'at-everyone',
			id: guild.id,
			color: 11493413,
		},
		guild,
	));
	client.guilds.cache.set(guild.id, guild);

	// Creates a fake Discord TextChannel.
	const channel = new Discord.TextChannel(guild, {
		name: 'Fake Channel',
		id: Discord.SnowflakeUtil.generate(),
		type: 0,
	});
	channel.send = (msg) => new Promise(() => ctxFakeReply(client, channel));
	guild.channels.cache.set(channel.id, channel);
	client.channels.cache.set(channel.id, channel);

	// Creates a fake Discord User.
	const user = new Discord.User(client, {
		username: 'Stefouch',
		discriminator: '0000',
		id: Discord.SnowflakeUtil.generate(),
	});
	client.users.cache.set(user.id, user);

	// Creates a fake Discord GuildMember.
	const member = Object.assign({
		displayColor: 11493413,
	}, new Discord.GuildMember(
		client,
		{
			nick: 'Stef',
			user: user,
			roles: [guild.roles.cache.first().id],
		},
		guild,
	));
	guild.members.cache.set(member.id, member);

	// Creates a fake Discord Message.
	const message = new Discord.Message(
		client,
		{
			name: 'Fake Message',
			id: Discord.SnowflakeUtil.generate(),
			author: user,
			member: member,
		},
		channel,
	);
	message.reply = (msg) => new Promise(() => ctxFakeReply(client, channel));
	channel.messages.cache.set(message.id, message);

	return message;
}

function ctxFakeReply(client, channel) {
	return new Discord.Message(client, {
		id: Discord.SnowflakeUtil.generate(),
		author: client.user,
		content: 'Say!',
	}, channel);
}