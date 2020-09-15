/* eslint-disable no-unused-vars */

const { describe, it } = require('mocha');
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
	const token = process.env.TOKEN;
	const bot = new Sebedius(require('../config.json'));

	// Fake discord message object
	const fakeMessage = {
		id: '755385578366697533',
		type: 0,
		author: {
			id: '405389936783523840',
			username: 'Bishop',
		},
		client: bot,
		content: 'Weylan-Yutani builds better worlds!',
		channel: {
			send: function(msg) {
				return;
			},
			guild: {
				id: '585361465641271296',
			},
		},
	};
	let fakeCtx, messageSendSpy;

	it('Sebedius is successfully created', function() {
		expect(bot.config.defaultPrefix === '!');
	});

	describe('# Check each command', function() {
		this.beforeEach(function() {
			fakeCtx = new ContextMessage('!', bot, fakeMessage,
				new Discord.TextChannel(
					new Discord.Guild(bot,
						{ type: 0 },
					),
					{},
				),
			);
			messageSendSpy = sinon.spy(fakeCtx);
		});

		for (const [cmdName, cmd] of bot.commands) {

			it(`Command: ${cmdName}`, async function() {
				expect(cmd.name).to.equal(cmdName);
				expect(cmd.category).to.be.a('string').with.length.greaterThan(1);
				expect(cmd.description).to.be.a('string').with.length.greaterThan(1);

				// const spyCtx = sinon.spy(fakeMessage);
				cmd.run([''], messageSendSpy);
				expect(messageSendSpy.called);

				// await cmd.run([''], fakeCtx);
				// expect(messageSendSpy.calledOnce);

				// expect(
				// 	cmd.run(['Hi!'], new ContextMessage('!', bot, new Discord.Message(), new Discord.TextChannel())),
				// ).to.be.a('Message');
			});
		}
	});
});