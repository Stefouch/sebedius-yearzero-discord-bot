const { describe, it } = require('mocha');
const expect = require('chai').expect;
const Keyv = require('keyv');
const Util = require('../utils/Util');

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

describe('Keyv & PostGreSQL Database', function() {
	this.slow(500);
	this.timeout(5000);
	this.retries(3);
	const name = 'test-' + Util.randomID();
	const key = 'project', value = 'E.D.E.N.';
	let kdb;

	this.beforeEach(function() {
		if (process.env.NODE_ENV !== 'production') {
			// this.skip();
		}
	});

	it('Should have NodeJS version 16.x', function() {
		const nodeVersion = +process.version.split('.')[0].slice(1);
		expect(nodeVersion).to.not.be.greaterThan(16);
		expect(nodeVersion).to.be.greaterThan(15);
	});

	it('Should have a DATABASE_URL environment variable', function() {
		const dbType = 'postgres';
		const partialURI = process.env.DATABASE_URL.slice(0, dbType.length);
		expect(
			partialURI,
			`DATABASE_URL should start with "${dbType}" to confirm the existence of the environment variable`,
		).to.equal(dbType);
	});

	it(`Should be able to create a Keyv DB (${name})`, async function() {
		kdb = new Keyv(process.env.DATABASE_URL, { namespace: name });
		kdb.on('error', err => console.error(`Keyv Connection Error: ${name.toUpperCase()}S\n`, err));
		expect(kdb.opts.store.namespace, `The DB's namespace should be "${name}"`).to.equal(name);

		const KeyvPostgres = require('@keyv/postgres');
		expect(kdb.opts.store instanceof KeyvPostgres, 'DB instance should be "KeyvPostgres"').to.be.true;
	});

	it('Should be able to set a DB entry', async function() {
		const mutant = await kdb.set(key, value);
		expect(mutant).to.be.true;
	});

	it('Should be able to get that DB entry', async function() {
		const mutant = await kdb.get(key);
		expect(mutant).to.equal(value);
	});

	it('Should be able to delete that DB entry', async function() {
		const ark = await kdb.delete(key);
		expect(ark).to.be.true;
	});
});
