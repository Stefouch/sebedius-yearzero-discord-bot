const { describe, it, beforeEach, afterEach } = require('mocha');
const expect = require('chai').expect;
const sinon = require('sinon');
const Discord = require('discord.js');
const Sebedius = require('../Sebedius');

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

describe('Discord Bot Client', function() {
	// this.slow(500);
	this.timeout(5000);
	// this.retries(3);

	// const token = process.env.TOKEN;
	const bot = new Sebedius(require('../config.json'));
	bot.user = new Discord.User(bot, {
		username: 'Sebedius',
		discriminator: '1234',
		id: bot.config.betaBotID,
	}),
	bot.muted = true;
	bot.state = 'ready',
	bot.owner = new Discord.User(bot, {
		username: 'BotOwner',
		discriminator: '1234',
		id: bot.config.ownerID,
	});
	bot.users.cache.set(bot.owner.id, bot.owner);

	it('Sebedius is successfully created', function() {
		expect(bot).to.be.instanceOf(Sebedius);
		expect(bot.id).to.equal(bot.config.betaBotID);
		expect(bot.owner).to.be.instanceOf(Discord.User);
		expect(bot.owner.id).to.equal(bot.config.ownerID);
		expect(bot.config.defaultPrefix).to.equal('!');
		expect(bot.commands.size).to.be.greaterThan(51);
	});

	it('All commands should have correct properties', function() {
		for (const [cmdName, cmd] of bot.commands) {
			expect(cmd.name, 'Command name').to.equal(cmdName);
			expect(cmd.category, 'Command category').to.be.a('string').with.length.greaterThan(0);
			expect(cmd.description, 'Command description').to.be.a('string').with.length.greaterThan(0);
		}
	});

	describe('# Check each command with custom args', function() {
		const sandbox = sinon.createSandbox();
		let ctx;

		beforeEach(function() {
			// Creates a Discord message with context (CTX).
			const message = fakeDiscord(bot);
			ctx = Sebedius.processMessage(message, '!');
		});

		afterEach(function() {
			sandbox.restore();
		});

		for (const [cmdName, cmd] of bot.commands) {

			it(`Command: ${cmdName}`, async function() {
				if (cmd.category === 'admin') this.skip();

				let args = [];
				if (cmdName === 'attack') args = ['alien', 'bloodburster', '1'];
				else if (cmdName === 'cast') args = ['6', 'Fireball'];
				else if (cmdName === 'character') this.skip();
				else if (cmdName === 'contact') args = ['99'];
				else if (cmdName === 'critfbl') args = ['stab', '69'];
				else if (cmdName.startsWith('crit')) args = ['42'];
				else if (cmdName === 'embed') args = ['Hello|World'];
				else if (cmdName === 'eval') args = ['true'];
				else if (cmdName === 'feral') args = ['99'];
				else if (cmdName === 'help') args = ['help'];
				else if (cmdName === 'init') args = ['help'];
				else if (cmdName === 'importcharacter') this.skip();
				else if (cmdName === 'job') args = ['mil'];
				else if (cmdName === 'journey') args = ['create', 'night', 'summer', 'hills', '-fbr'];
				else if (cmdName === 'module') args = ['99'];
				else if (cmdName === 'monster') args = ['myz', 'cannibal'];
				else if (cmdName === 'mutation') args = ['99'];
				else if (cmdName === 'myzpower') args = ['myz', '99'];
				else if (cmdName === 'resource') args = ['d8', 'Torches'];
				else if (cmdName.startsWith('roll')) args = ['5b2g', 'd10', '-p', '0', '#', 'Uber Roll!'];
				else if (cmdName === 'setconf') args = ['lang'];
				else if (cmdName === 'setpresence') args = ['idle'];

				const matahari = sandbox.spy(ctx, 'send');

				await cmd.run(args, ctx);

				if (['setconf', 'setpresence'].includes(cmdName)) expect(matahari.notCalled).to.be.true;
				else expect(matahari.calledOnce).to.be.true;
			});
		}
	});
});

/**
 * Creates a fake Discord message with full needed data.
 * Includes (all cached):
 * * 1x Guild
 * * 1x Role (@everyone)
 * * 1x TextChannel
 * * 1x User
 * * 2x GuildMembers
 * * 1x Message (returned) with overriden methods: `send`, `reply`, `delete` and `react`.
 * @param {Discord.Client} client The bot
 * @returns {Discord.Message}
 */
function fakeDiscord(client) {
	// Creates a fake Discord Guild/Server.
	const guild = new Discord.Guild(
		client,
		{
			name: 'Fake Guild',
			id: Discord.SnowflakeUtil.generate(),
			type: 0,
			owner_id: client.user.id,
		},
	);
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
	const channel = Object.assign(
		new Discord.TextChannel(
			guild,
			{
				name: 'Fake Channel',
				id: Discord.SnowflakeUtil.generate(),
				type: 0,
			},
		),
		{
			send: async (msg) => fakeSimpleMessage(client, channel, msg),
		},
	);
	guild.channels.cache.set(channel.id, channel);
	client.channels.cache.set(channel.id, channel);

	// Creates a fake Discord User.
	const user = new Discord.User(
		client,
		{
			username: 'Stefouch',
			discriminator: '0000',
			id: Discord.SnowflakeUtil.generate(),
		},
	);
	client.users.cache.set(user.id, user);

	// Creates a fake Discord GuildMember.
	const member = Object.assign(
		{
			displayColor: 11493413,
			// TODO: permissions: new Discord.Permissions(Discord.Permissions.ALL),
		},
		new Discord.GuildMember(
			client,
			{
				nick: 'Stef',
				user: user,
				roles: [guild.roles.cache.first().id],
			},
			guild,
		),
	);
	guild.members.cache.set(member.id, member);
	guild.members.cache.set(client.user.id, new Discord.GuildMember(
		client,
		{
			nick: 'Seb',
			user: client.user,
			roles: [guild.roles.cache.first().id],
		},
		guild,
	));

	// Creates a fake Discord Message.
	const message = Object.assign(
		new Discord.Message(
			client,
			{
				name: 'Fake Message',
				id: Discord.SnowflakeUtil.generate(),
				author: user,
				member: member,
			},
			channel,
		),
		{
			edit: async (msg) => fakeSimpleMessage(client, channel, msg),
			reply: async (msg) => fakeSimpleMessage(client, channel, msg),
			react: async () => true,
			delete: async () => true,
		},
	);
	channel.messages.cache.set(message.id, message);

	return message;
}

/**
 * Creates a simple fake Discord Message.
 * @param {Discord.Client} client
 * @param {Discord.TextChannel} channel
 * @param {string} [msg]
 * @returns {Discord.Message|Object}
 */
function fakeSimpleMessage(client, channel, msg = 'Hello') {
	return {
		client,
		id: Discord.SnowflakeUtil.generate(),
		author: client.user,
		content: msg,
		channel: channel,
		member: {
			displayColor: 0,
		},
		send: async () => true,
		edit: async () => true,
		reply: async () => true,
		react: async () => true,
		delete: async () => true,
		createReactionCollector: () => {
			return { on: () => true };
		},
	};
	// return new Discord.Message(
	// 	client,
	// 	{
	// 		id: Discord.SnowflakeUtil.generate(),
	// 		author: client.user,
	// 		content: msg,
	// 	},
	// 	channel,
	// );
}