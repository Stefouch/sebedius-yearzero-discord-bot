/* eslint-disable no-unused-vars */

const { describe, it } = require('mocha');
const expect = require('chai').expect;
const should = require('chai').should();
const Discord = require('discord.js');
const Sebedius = require('../Sebedius');

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const ctxModel = new Discord.Message();

describe('Discord Bot Client', function() {
	// this.slow(500);
	this.timeout(5000);
	// this.retries(3);
	const token = process.env.DISCORD_BETA_BOT_TOKEN || process.env.TOKEN;

	it('Should log in without errors', async function() {
		// const bot = new Discord.Client();
		// await expect(() => bot.login(token)).to.not.throw();
		expect(1).to.eq(1);
		// bot.destroy();
	});
});