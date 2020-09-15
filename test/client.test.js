/* eslint-disable no-unused-vars */

const { describe, it } = require('mocha');
const expect = require('chai').expect;
// const should = require('chai').should();
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

	it('Sebedius is created without error', function() {
		expect(bot.config.defaultPrefix === '!');
	});

	describe('# Test each commad', function() {
		for (const [cmdName, cmd] of bot.commands) {

			it(`Command: ${cmdName}`, function() {
				expect(cmd.name).to.equal(cmdName);
				expect(cmd.category).to.be.a('string').with.length.greaterThan(1);
				expect(cmd.description).to.be.a('string').with.length.greaterThan(1);

				expect(
					cmd.run(['Hi!'], new ContextMessage('!', bot, {}, new Discord.TextChannel())),
				).to.be.a('Message');
			});
		}
	});
});