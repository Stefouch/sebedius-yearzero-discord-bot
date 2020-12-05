const { describe, it } = require('mocha');
const expect = require('chai').expect;
const Util = require('../utils/Util');
const YZRoll = require('../yearzero/YZRoll');
const RollTable = require('../utils/RollTable');
const { clamp } = require('../utils/Util');

describe('YZRoll Module', function() {
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

	describe('# T2K Rolls', function() {
		const ranges = [6, 8, 10, 12];

		// For each range...
		for (let r = 0; r < ranges.length; r++) {
			// ...roll 1 or 2 base dice...
			for (let n = 1; n < 3; n++) {
				// ...with -10 to +10 modifier.
				for(let m = -10; m < 11; m++) {
					const rw = new YZRoll('t2k').addDice('base', n, ranges[r]);
					const title = `Should ${m >= 0 ? 'add +' : 'remove '}${m} to ${rw.toPhrase()}`;

					it(title, function() {
						// Checks the correct initial size.
						expect(rw.size).to.equal(n);

						// Checks the modifier.
						rw.modify(m);
						const x = clamp(n * (r + 1) + m, 1, 8);
						const y = rw.dice.reduce((sum, d) => sum + ranges.indexOf(d.range) + 1, 0);
						expect(x).to.equal(y);
					});
				}
			}
		}
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

		it('Checking a ±0 modifier', function() {
			let r = YZRoll.parse('1+0');
			expect(r.getDice('modifier')).to.have.lengthOf(2);
			expect(r.sum()).to.equal(1);
			r = YZRoll.parse('1-0');
			expect(r.getDice('modifier')).to.have.lengthOf(2);
			expect(r.sum()).to.equal(1);
		});
	});
});

describe('RollTable Module - D6', function() {
	const rt = new RollTable('Box of Stef', 'D6', [
		['1-3', 'Sebedius'],
		['4-5', 'Thaddeus'],
		['6', 'Retzius'],
	]);

	it('Should have correct properties', function() {
		expect(rt.min).to.equal(1);
		expect(rt.max).to.equal(6);
		expect(rt.length).to.equal(6);
		expect(rt.size).to.equal(3);
		expect(rt.d).to.equal('D6');
	});

	it('Should return Sebedius', function() {
		expect(rt.get(0)).to.equal('Sebedius');
	});

	it('Should return Thaddeus', function() {
		expect(rt.get('5')).to.equal('Thaddeus');
	});

	it('Should return Retzius', function() {
		expect(rt.get(7)).to.equal('Retzius');
	});

	it('Should return correct random values', function() {
		for (let i = 0; i < 1000; i++) {
			expect(rt.random()).to.be.a('string');
		}
	});
});

describe('RollTable Module - D66', function() {
	const rt = new RollTable('Box of Stef', 'D66', [
		['11-22', 'Sebedius'],
		['23-56', 'Thaddeus'],
		['61-66', 'Retzius'],
	]);

	it('Should have correct properties', function() {
		expect(rt.min).to.equal(11);
		expect(rt.max).to.equal(66);
		expect(rt.length).to.equal(36);
		expect(rt.size).to.equal(3);
		expect(rt.d).to.equal('D66');
	});

	it('Should return Sebedius', function() {
		expect(rt.get(0)).to.equal('Sebedius');
	});

	it('Should return Thaddeus', function() {
		expect(rt.get('33')).to.equal('Thaddeus');
	});

	it('Should return Retzius', function() {
		expect(rt.get(100)).to.equal('Retzius');
	});

	it('Should return correct random values', function() {
		for (let i = 0; i < 10000; i++) {
			expect(rt.random()).to.be.a('string');
		}
	});
});