const { describe, it } = require('mocha');
const expect = require('chai').expect;
const YearZeroRoll = require('../src/yearzero/roller/yzroll');
const YearZeroDice = require('../src/yearzero/roller/dice');
const RollTable = require('../src/utils/RollTable');
const { YearZeroGames } = require('../src/constants');
const { YearZeroDieTypes } = require('../src/yearzero/roller/dice/dice-constants');
const { clamp, rand } = require('../src/utils/number-utils');

describe('YEARZERO ROLL MODULE', function () {
  const roll = new YearZeroRoll({
    game: YearZeroGames.MUTANT_YEAR_ZERO,
    author: 'Stefouch',
    name: 'Test Roll',
  });

  let count = 0;
  const qty = rand(2, 6);
  Object.values(YearZeroDice).forEach(Die => {
    count++;
    it(`Should add ${qty} x ${Die.name} random dice`, function () {
      roll.addDice(Die, qty);
      expect(roll.dice.filter(d => d.constructor.name === Die.name)).to.have.lengthOf(qty);
    });
  });

  it(`Should finally have ${qty * count} dice`, function () {
    expect(roll.dice).to.have.lengthOf(qty * count);
  });

  it('Should be able to remove dice correctly', function () {
    // Stress dice on 1 stops the pushability.
    roll.removeDice(YearZeroDieTypes.STRESS, qty);
    expect(roll.dice, 'Stress').to.have.lengthOf(qty * (count - 1));
    roll.removeDice(YearZeroDieTypes.NEG, qty);
    expect(roll.dice, 'Neg').to.have.lengthOf(qty * (count - 2));
  });

  it('Should be rollable & pushable', async function () {
    await roll.roll();
    expect(roll.pushCount).to.equal(0);
    await roll.push();
    expect(roll.pushCount).to.equal(1);
  });

  describe('❯ T2K Rolls', function () {
    const ranges = [6, 8, 10, 12];

    // For each range...
    for (let r = 0; r < ranges.length; r++) {
      // ...roll 1 or 2 base dice...
      for (let n = 1; n < 3; n++) {
        // ...with -10 to +10 modifier.
        for(let m = -10; m < 11; m++) {
          const rw = new YearZeroRoll({ game: YearZeroGames.TWILIGHT_2K })
            .addDice(YearZeroDice.TwilightDie, n, { faces: ranges[r] });

          const title = `Should ${m >= 0 ? 'add +' : 'remove '}${m} to ${rw.toString()}`;

          it(title, async function () {
            // Checks the correct initial size.
            expect(rw.size).to.equal(n);

            rw.modify(m);
            await rw.roll();

            // Checks the modifier.
            const x = clamp(n * (r + 1) + m, 1, 8);
            const y = rw.dice.reduce((sum, d) => sum + ranges.indexOf(d.faces) + 1, 0);
            expect(x).to.equal(y);
          });
        }
      }
    }
  });

  // describe('# Roll Parser: YZRoll.parse()', function () {

  //   it('Should parse correctly', function () {
  //     let r = YearZeroRoll.parse('d100+2d20+3d12+4d10+5d8+6d6+7');
  //     expect(r.dice).to.have.lengthOf(22);
  //     r = YearZeroRoll.parse('3d6[base]+2d6[skill]+d6[gear]-3');
  //     expect(r.dice).to.have.lengthOf(7);
  //     expect(r.getDice('base'), '3d6[base]').to.have.lengthOf(3);
  //     expect(r.getDice('skill'), '2d6[skill]').to.have.lengthOf(2);
  //     expect(r.getDice('gear'), 'd6[gear]').to.have.lengthOf(1);
  //     expect(r.getDice('modifier'), '-3').to.have.lengthOf(1);
  //   });

  //   it('Checking a ±0 modifier', function () {
  //     let r = YearZeroRoll.parse('1+0');
  //     expect(r.getDice('modifier')).to.have.lengthOf(2);
  //     expect(r.sum()).to.equal(1);
  //     r = YearZeroRoll.parse('1-0');
  //     expect(r.getDice('modifier')).to.have.lengthOf(2);
  //     expect(r.sum()).to.equal(1);
  //   });
  // });
});

describe('YEARZERO ROLL TABLE MODULE - D6', function () {
  const rt = new RollTable('Box of Stef', 'D6', [
    [1, 'Sebedius'],
    [3, 'Thaddeus'],
    [6, 'Retzius'],
  ]);

  it('Should have correct properties', function () {
    expect(rt.min).to.equal(1);
    expect(rt.max).to.equal(6);
    // expect(rt.length).to.equal(6);
    expect(rt.size).to.equal(3);
    expect(rt.roller).to.equal('D6');
  });

  it('Should return Sebedius', function () {
    expect(rt.get(0)).to.equal('Sebedius');
  });

  it('Should return Thaddeus', function () {
    expect(rt.get(2)).to.equal('Thaddeus');
  });

  it('Should return Retzius', function () {
    expect(rt.get(7)).to.equal('Retzius');
  });

  it('Should return correct random values', function () {
    for (let i = 0; i < 1000; i++) {
      expect(rt.roll()).to.be.a('string');
    }
  });
});

describe('YEARZERO ROLL TABLE MODULE - D66', function () {
  const rt = new RollTable('Box of Stef', 'D66', [
    [22, 'Sebedius'],
    [56, 'Thaddeus'],
    [66, 'Retzius'],
  ]);

  it('Should have correct properties', function () {
    expect(rt.min).to.equal(11);
    expect(rt.max).to.equal(66);
    // expect(rt.length).to.equal(36);
    expect(rt.size).to.equal(3);
    expect(rt.roller).to.equal('D66');
  });

  it('Should return Sebedius', function () {
    expect(rt.get(0)).to.equal('Sebedius');
  });

  it('Should return Thaddeus', function () {
    expect(rt.get(33)).to.equal('Thaddeus');
  });

  it('Should return Retzius', function () {
    expect(rt.get(100)).to.equal('Retzius');
  });

  it('Should return correct random values', function () {
    for (let i = 0; i < 10000; i++) {
      expect(rt.roll()).to.be.a('string');
    }
  });
});
