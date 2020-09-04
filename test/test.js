/* eslint-disable no-undef */

const assert = require('assert').strict;
const Keyv = require('keyv');
const YZRoll = require('../yearzero/YZRoll');

require('dotenv').config();

describe('Testing database connections', function() {
	const name = 'test';
	let kdb;

	it('Should be able to create a Keyv DB', async function() {
		kdb = new Keyv(process.env.DATABASE_URL, { namespace: name });
		kdb.on('error', err => console.error(`Keyv Connection Error: ${name.toUpperCase()}S\n`, err));
		assert.strictEqual(kdb.opts.store.namespace, name);
		const KeyvPostgres = require('@keyv/postgres');
		assert.strictEqual(kdb.opts.store instanceof KeyvPostgres, true);
	});

	it('Should be able to set a DB entry', async function() {
		const james = await kdb.set('007', 'James Bond');
		assert.strictEqual(james, true);
	});

	it('Should be able to get that DB entry', async function() {
		const bond = await kdb.get('007');
		assert.strictEqual(bond, 'James Bond');
	});

	it('Should be able to delete that DB entry', async function() {
		const kill = await kdb.delete('007');
		assert.strictEqual(kill, true);
	});
});