/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const expect = require('chai').expect;
const should = require('chai').should();
const Keyv = require('keyv');
const Util = require('../utils/Util');
const YZRoll = require('../yearzero/YZRoll');

require('dotenv').config();

describe('Testing the YZRoll', function() {
	const roll = new YZRoll('myz', 'Stefouch', 'Test Roll');

	let count = 0;
	const qty = Util.rand(2, 6);
	YZRoll.DIE_TYPES.forEach(dt => {
		if (dt === 'modifier') return;
		count++;
		it(`Should add ${qty} x ${dt.toUpperCase()} random dice`, function() {
			roll.addDice(dt, qty);
			expect(roll.getDice(dt)).to.have.lengthOf(qty);
		});
	});

	it(`Should finally have ${qty * count} dice`, function() {
		expect(roll.dice).to.have.lengthOf(qty * count);
	});

	it('Should be pushable only once by default', function() {
		roll.push().push().push();
		expect(roll.pushCount).to.equal(1);
	});

	describe('# Roll Parser: YZRoll.parse()', function() {

		it('Should parse correctly', function() {
			let r = YZRoll.parse('d100+2d20+3d12+4d10+5d8+6d6+7');
			expect(r.dice).to.have.lengthOf(22);
			r = YZRoll.parse('3d6[base]+2d6[skill]+d6[gear]-3');
			expect(r.dice).to.have.lengthOf(7);
			expect(r.getDice('base'), '3d6[base]').to.have.lengthOf(3);
			expect(r.getDice('skill'), '2d6[skill]').to.have.lengthOf(2);
			expect(r.getDice('gear'), 'd6[gear]').to.have.lengthOf(1);
			expect(r.getDice('modifier'), '-3').to.have.lengthOf(1);
		});

		it('Checking a modifier ±0', function() {
			let r = YZRoll.parse('1+0');
			expect(r.getDice('modifier')).to.have.lengthOf(2);
			expect(r.sum()).to.equal(1);
			r = YZRoll.parse('1-0');
			expect(r.getDice('modifier')).to.have.lengthOf(2);
			expect(r.sum()).to.equal(1);
		});
	});
});

describe('Testing database connections', function() {
	this.slow(500);
	this.timeout(5000);
	this.retries(3);
	const name = 'test-' + Util.randomID();
	const key = 'project', value = 'E.D.E.N.';
	let kdb;

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
		mutant.should.be.true;
	});

	it('Should be able to get that DB entry', async function() {
		const mutant = await kdb.get(key);
		mutant.should.equal(value);
	});

	it('Should be able to delete that DB entry', async function() {
		const ark = await kdb.delete(key);
		ark.should.be.true;
	});
});