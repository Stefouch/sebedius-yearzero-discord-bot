const { describe, it } = require('mocha');
const expect = require('chai').expect;
const Util = require('../utils/Util');
const YZRoll = require('../yearzero/YZRoll');

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